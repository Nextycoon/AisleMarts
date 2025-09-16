"""
Enhanced Search Service - Aggregation and Scoring Engine
MongoDB aggregation pipelines for multilingual search, deduplication, and Best Pick scoring
"""
import hashlib
import re
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Any
from motor.motor_asyncio import AsyncIOMotorDatabase

from search_models import (
    SearchWeights, SearchLanguages, SearchModes,
    SearchResult, BestPick, Merchant, Offer, SearchResponse, OffersResponse
)


class SearchService:
    """Enhanced search service with aggregation pipelines and scoring"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.weights = SearchWeights()
    
    async def search_products(
        self,
        query: str,
        mode: str = SearchModes.ALL,
        lang: str = SearchLanguages.ENGLISH,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        page: int = 1,
        limit: int = 24,
        image: Optional[str] = None,
        barcode: Optional[str] = None
    ) -> SearchResponse:
        """
        Enhanced product search with multilingual support and Best Pick scoring
        """
        skip = (page - 1) * limit
        
        # Build search pipeline
        pipeline = await self._build_search_pipeline(
            query=query,
            mode=mode,
            lang=lang,
            lat=lat,
            lon=lon,
            image=image,
            barcode=barcode,
            skip=skip,
            limit=limit
        )
        
        # Execute aggregation
        cursor = self.db.products.aggregate(pipeline)
        results = await cursor.to_list(length=None)
        
        # Process results with deduplication and scoring
        search_results = []
        for result in results:
            if result.get('offers'):
                search_result = await self._process_search_result(result)
                if search_result:
                    search_results.append(search_result)
        
        # Get total count
        total = await self._get_search_count(query, mode, lang, barcode)
        
        return SearchResponse(
            query=query,
            mode=mode,
            results=search_results,
            page=page,
            limit=limit,
            total=total,
            filters_applied={"lang": lang, "mode": mode}
        )
    
    async def get_product_offers(self, product_id: str) -> OffersResponse:
        """
        Get all offers for a specific product with deduplication info
        """
        # Aggregation to get product with all offers
        pipeline = [
            {"$match": {"_id": product_id, "active": True}},
            {
                "$lookup": {
                    "from": "offers",
                    "localField": "_id",
                    "foreignField": "product_id",
                    "as": "offers"
                }
            },
            {
                "$lookup": {
                    "from": "merchants",
                    "localField": "offers.merchant_id",
                    "foreignField": "_id",
                    "as": "merchants"
                }
            }
        ]
        
        cursor = self.db.products.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        if not result:
            return OffersResponse(product_id=product_id, offers=[], total_offers=0)
        
        product_data = result[0]
        offers = []
        merchant_map = {m["_id"]: m for m in product_data.get("merchants", [])}
        
        for offer_doc in product_data.get("offers", []):
            merchant_doc = merchant_map.get(offer_doc["merchant_id"])
            if merchant_doc:
                merchant = Merchant(
                    id=merchant_doc["_id"],
                    name=merchant_doc["name"],
                    type=merchant_doc["type"],
                    trust_score=merchant_doc["trust_score"],
                    country=merchant_doc.get("country"),
                    verification_status=merchant_doc["verification_status"]
                )
                
                offer = Offer(
                    id=offer_doc["_id"],
                    merchant=merchant,
                    price_minor=offer_doc["price_minor"],
                    currency=offer_doc["currency"],
                    delivery_days=offer_doc["delivery_days"],
                    stock=offer_doc["stock"],
                    condition=offer_doc["condition"],
                    attrs=offer_doc.get("attrs", {}),
                    last_seen_at=offer_doc["last_seen_at"]
                )
                offers.append(offer)
        
        # Sort offers by total landed cost (price + delivery penalty)
        offers.sort(key=lambda o: o.price_minor + (o.delivery_days * 100))
        
        return OffersResponse(
            product_id=product_id,
            offers=offers,
            total_offers=len(offers)
        )
    
    async def _build_search_pipeline(
        self,
        query: str,
        mode: str,
        lang: str,
        lat: Optional[float],
        lon: Optional[float],
        image: Optional[str],
        barcode: Optional[str],
        skip: int,
        limit: int
    ) -> List[Dict]:
        """Build MongoDB aggregation pipeline for search"""
        
        pipeline = []
        
        # 1. Match active products
        match_stage = {"active": True}
        
        # Barcode search (highest priority)
        if barcode:
            match_stage["gtin"] = barcode
        else:
            # Text search across multiple fields and languages
            if query:
                text_conditions = []
                
                # Search in main fields
                text_conditions.extend([
                    {"title": {"$regex": query, "$options": "i"}},
                    {"description": {"$regex": query, "$options": "i"}},
                    {"brand": {"$regex": query, "$options": "i"}}
                ])
                
                # Search in language tokens
                lang_field = f"lang_tokens.{lang}"
                text_conditions.append({lang_field: {"$in": self._tokenize_query(query)}})
                
                match_stage["$or"] = text_conditions
        
        pipeline.append({"$match": match_stage})
        
        # 2. Lookup offers with merchants
        pipeline.extend([
            {
                "$lookup": {
                    "from": "offers",
                    "localField": "_id",
                    "foreignField": "product_id",
                    "as": "offers"
                }
            },
            {
                "$lookup": {
                    "from": "merchants",
                    "localField": "offers.merchant_id",
                    "foreignField": "_id",
                    "as": "merchants"
                }
            }
        ])
        
        # 3. Filter by merchant type based on mode
        if mode in [SearchModes.RETAIL, SearchModes.B2B]:
            merchant_types = ["retail"] if mode == SearchModes.RETAIL else ["wholesale", "factory", "farm"]
            pipeline.append({
                "$match": {
                    "merchants.type": {"$in": merchant_types}
                }
            })
        
        # 4. Add scoring fields
        pipeline.append({
            "$addFields": {
                "search_score": await self._build_scoring_expression(query, lang),
                "offer_count": {"$size": "$offers"}
            }
        })
        
        # 5. Filter products with offers
        pipeline.append({"$match": {"offer_count": {"$gt": 0}}})
        
        # 6. Sort by search score
        pipeline.append({"$sort": {"search_score": -1, "_id": 1}})
        
        # 7. Pagination
        pipeline.extend([
            {"$skip": skip},
            {"$limit": limit}
        ])
        
        return pipeline
    
    async def _build_scoring_expression(self, query: str, lang: str) -> Dict:
        """Build MongoDB expression for search scoring"""
        return {
            "$add": [
                # Title match boost
                {
                    "$cond": [
                        {"$regexMatch": {"input": "$title", "regex": query, "options": "i"}},
                        0.5,
                        0
                    ]
                },
                # Brand match boost
                {
                    "$cond": [
                        {"$regexMatch": {"input": "$brand", "regex": query, "options": "i"}},
                        0.3,
                        0
                    ]
                },
                # Language token boost (with null check)
                {
                    "$cond": [
                        {
                            "$and": [
                                {"$ne": [f"$lang_tokens.{lang}", None]},
                                {"$isArray": f"$lang_tokens.{lang}"},
                                {"$gt": [{"$size": {"$ifNull": [f"$lang_tokens.{lang}", []]}}, 0]}
                            ]
                        },
                        0.4,
                        0
                    ]
                },
                # Base relevance
                {"$ifNull": ["$search_boost", 0.1]}
            ]
        }
    
    async def _process_search_result(self, result: Dict) -> Optional[SearchResult]:
        """Process aggregation result into SearchResult with Best Pick"""
        try:
            # Calculate best pick from offers
            offers_data = result.get("offers", [])
            merchants_data = {m["_id"]: m for m in result.get("merchants", [])}
            
            if not offers_data:
                return None
            
            best_offer_data, best_score = await self._calculate_best_pick(
                offers_data, merchants_data
            )
            
            if not best_offer_data:
                return None
            
            # Build best pick
            merchant_data = merchants_data[best_offer_data["merchant_id"]]
            best_pick = BestPick(
                offer_id=best_offer_data["_id"],
                price_minor=best_offer_data["price_minor"],
                currency=best_offer_data["currency"],
                score=best_score,
                reasons=await self._get_scoring_reasons(best_offer_data, merchant_data),
                explanation=await self._generate_best_pick_explanation(
                    best_offer_data, merchant_data, best_score
                )
            )
            
            # Build product info (remove MongoDB-specific fields)
            product = {k: v for k, v in result.items() 
                      if k not in ["offers", "merchants", "search_score", "offer_count"]}
            
            # Get deduplication info
            dedup_info = await self._get_dedup_info(result)
            
            return SearchResult(
                product=product,
                best_pick=best_pick,
                offers_count=len(offers_data),
                dedup_info=dedup_info
            )
            
        except Exception as e:
            print(f"Error processing search result: {e}")
            return None
    
    async def _calculate_best_pick(
        self, 
        offers_data: List[Dict], 
        merchants_data: Dict[str, Dict]
    ) -> Tuple[Optional[Dict], float]:
        """Calculate best offer using weighted scoring algorithm"""
        
        best_offer = None
        best_score = 0.0
        
        # Normalize values for scoring
        prices = [o["price_minor"] for o in offers_data if o.get("price_minor")]
        etas = [o["delivery_days"] for o in offers_data if o.get("delivery_days")]
        
        min_price = min(prices) if prices else 1
        max_price = max(prices) if prices else 1
        min_eta = min(etas) if etas else 1
        max_eta = max(etas) if etas else 1
        
        for offer in offers_data:
            merchant = merchants_data.get(offer["merchant_id"])
            if not merchant:
                continue
            
            # Calculate normalized scores (higher is better)
            price_score = 1.0 - ((offer["price_minor"] - min_price) / max(max_price - min_price, 1))
            eta_score = 1.0 - ((offer["delivery_days"] - min_eta) / max(max_eta - min_eta, 1))
            trust_score = merchant.get("trust_score", 0.5)
            culture_score = 0.8  # TODO: Implement cultural matching
            stock_score = 1.0 if offer.get("stock", 0) > 0 else 0.0
            
            # Weighted final score
            final_score = (
                price_score * self.weights.PRICE +
                eta_score * self.weights.ETA +
                trust_score * self.weights.TRUST +
                culture_score * self.weights.CULTURE +
                stock_score * self.weights.STOCK
            )
            
            if final_score > best_score:
                best_score = final_score
                best_offer = offer
        
        return best_offer, best_score
    
    async def _get_scoring_reasons(self, offer: Dict, merchant: Dict) -> List[str]:
        """Get reasons why this offer was selected as Best Pick"""
        reasons = []
        
        # Simple heuristics for demo
        if offer["price_minor"] < 200000:  # Under $2000 equivalent
            reasons.append("price")
        
        if offer["delivery_days"] <= 3:
            reasons.append("eta")
        
        if merchant.get("trust_score", 0) > 0.8:
            reasons.append("trust")
        
        if merchant.get("verification_status") == "verified":
            reasons.append("cultural_fit")
        
        if offer.get("stock", 0) > 0:
            reasons.append("stock")
        
        return reasons[:3]  # Limit to top 3 reasons
    
    async def _generate_best_pick_explanation(
        self, 
        offer: Dict, 
        merchant: Dict, 
        score: float
    ) -> str:
        """Generate human-readable explanation for Best Pick selection"""
        
        reasons = []
        
        if offer["price_minor"] < 200000:
            reasons.append("competitive pricing")
        
        if offer["delivery_days"] <= 3:
            reasons.append("fast delivery")
        
        if merchant.get("trust_score", 0) > 0.8:
            reasons.append("high seller trust")
        
        explanation = f"Selected for {', '.join(reasons[:2])}"
        if len(reasons) > 2:
            explanation += f" and {reasons[2]}"
        
        return f"{explanation} (Score: {score:.1f}/1.0)"
    
    async def _get_dedup_info(self, result: Dict) -> Optional[Dict[str, str]]:
        """Get deduplication information for debugging"""
        return {
            "gtin": result.get("gtin", "none"),
            "brand": result.get("brand", "unknown"),
            "image_hash": result.get("image_hashes", [None])[0] or "none"
        }
    
    async def _get_search_count(
        self, 
        query: str, 
        mode: str, 
        lang: str, 
        barcode: Optional[str]
    ) -> int:
        """Get total count for search results"""
        # Simplified count query
        match_stage = {"active": True}
        
        if barcode:
            match_stage["gtin"] = barcode
        elif query:
            match_stage["$or"] = [
                {"title": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"brand": {"$regex": query, "$options": "i"}}
            ]
        
        count = await self.db.products.count_documents(match_stage)
        return count
    
    def _tokenize_query(self, query: str) -> List[str]:
        """Tokenize search query into searchable terms"""
        # Simple tokenization - can be enhanced with NLP
        tokens = re.findall(r'\w+', query.lower())
        return [token for token in tokens if len(token) > 2]
    
    async def index_product(self, product_data: Dict) -> None:
        """Index product with enhanced search fields"""
        # Generate image hashes for deduplication
        image_hashes = []
        for image_url in product_data.get("images", []):
            if image_url:
                hash_obj = hashlib.md5(image_url.encode())
                image_hashes.append(hash_obj.hexdigest()[:16])
        
        # Generate language tokens
        title = product_data.get("title", "")
        description = product_data.get("description", "")
        brand = product_data.get("brand", "")
        
        lang_tokens = {
            SearchLanguages.ENGLISH: self._tokenize_query(f"{title} {description} {brand}"),
            # TODO: Add other language tokenization
        }
        
        # Update product with enhanced fields
        enhanced_fields = {
            "image_hashes": image_hashes,
            "lang_tokens": lang_tokens,
            "search_boost": 1.0,
            "updated_at": datetime.utcnow()
        }
        
        await self.db.products.update_one(
            {"_id": product_data["_id"]},
            {"$set": enhanced_fields}
        )


# ============= UTILITY FUNCTIONS =============

async def create_search_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create all required indexes for enhanced search"""
    
    # Products indexes
    try:
        await db.products.create_index([("title", "text"), ("description", "text"), ("brand", "text")])
        await db.products.create_index("gtin")
        await db.products.create_index("brand")
        await db.products.create_index("active")
        await db.products.create_index([("brand", 1), ("title", 1)])
        await db.products.create_index("image_hashes")
        print("✅ Products indexes created")
    except Exception as e:
        print(f"⚠️ Products indexes error: {e}")
    
    # Merchants indexes
    try:
        await db.merchants.create_index("name")
        await db.merchants.create_index("type")
        await db.merchants.create_index([("trust_score", -1)])
        await db.merchants.create_index("verification_status")
        print("✅ Merchants indexes created")
    except Exception as e:
        print(f"⚠️ Merchants indexes error: {e}")
    
    # Offers indexes
    try:
        await db.offers.create_index("product_id")
        await db.offers.create_index("merchant_id")
        await db.offers.create_index([("product_id", 1), ("price_minor", 1)])
        await db.offers.create_index([("last_seen_at", -1)])
        print("✅ Offers indexes created")
    except Exception as e:
        print(f"⚠️ Offers indexes error: {e}")
    
    # Locations indexes
    try:
        await db.locations.create_index("merchant_id")
        await db.locations.create_index([("lat", 1), ("lon", 1)])
        await db.locations.create_index("services")
        print("✅ Locations indexes created")
    except Exception as e:
        print(f"⚠️ Locations indexes error: {e}")


async def seed_sample_data(db: AsyncIOMotorDatabase) -> None:
    """Seed sample merchants, offers, and locations for testing"""
    
    # Sample merchants
    merchants = [
        {
            "_id": "merchant_001",
            "name": "Kilimall Kenya",
            "type": "retail",
            "trust_score": 0.92,
            "sources": ["api"],
            "country": "KE",
            "currency": "KES",
            "description": "Leading online marketplace in Kenya",
            "contact_info": {"email": "support@kilimall.co.ke"},
            "verification_status": "verified",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "merchant_002",
            "name": "Nairobi Electronics Hub",
            "type": "wholesale",
            "trust_score": 0.87,
            "sources": ["manual"],
            "country": "KE",
            "currency": "KES",
            "description": "Wholesale electronics supplier",
            "contact_info": {"phone": "+254712345678"},
            "verification_status": "verified",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Insert merchants
    for merchant in merchants:
        await db.merchants.replace_one(
            {"_id": merchant["_id"]}, 
            merchant, 
            upsert=True
        )
    
    print(f"✅ Seeded {len(merchants)} merchants")
    
    # Sample offers (for existing products)
    existing_products = await db.products.find({"active": True}).limit(5).to_list(length=5)
    
    offers = []
    for i, product in enumerate(existing_products):
        # Create 2-3 offers per product
        for j in range(2):
            merchant_id = merchants[j % len(merchants)]["_id"]
            base_price = int(product.get("price", 100) * 100)  # Convert to minor units
            
            offer = {
                "_id": f"offer_{product['_id']}_{j}",
                "product_id": product["_id"],
                "merchant_id": merchant_id,
                "price_minor": base_price + (j * 1000),  # Slight price variation
                "currency": "KES",
                "delivery_days": 2 + j,
                "stock": 10 - (j * 2),
                "condition": "new",
                "source": "mock",
                "attrs": {"color": ["Black", "White"][j]},
                "last_seen_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            offers.append(offer)
    
    # Insert offers
    for offer in offers:
        await db.offers.replace_one(
            {"_id": offer["_id"]}, 
            offer, 
            upsert=True
        )
    
    print(f"✅ Seeded {len(offers)} offers")
    
    # Sample locations
    locations = [
        {
            "_id": "location_001",
            "merchant_id": "merchant_001",
            "name": "Kilimall Westgate",
            "address": "Westgate Shopping Mall, Nairobi",
            "lat": -1.2921,
            "lon": 36.8219,
            "services": ["onsite", "pickup"],
            "hours": {"mon_fri": "10:00-22:00", "weekend": "10:00-20:00"},
            "phone": "+254700123456",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Insert locations
    for location in locations:
        await db.locations.replace_one(
            {"_id": location["_id"]}, 
            location, 
            upsert=True
        )
    
    print(f"✅ Seeded {len(locations)} locations")