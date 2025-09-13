from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import openai
from app.config.database import get_database
from app.config.settings import settings
from app.models import ChatSession, ChatMessage, User, Product
from app.services.auth import get_current_active_user
from bson import ObjectId

# Configure OpenAI
if settings.OPENAI_API_KEY:
    openai.api_key = settings.OPENAI_API_KEY

router = APIRouter()

@router.post("/chat", response_model=dict)
async def chat_with_ai(
    message: str,
    session_id: str = None,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured"
        )
    
    # Get or create chat session
    if session_id and ObjectId.is_valid(session_id):
        chat_session = await db.chat_sessions.find_one({
            "_id": ObjectId(session_id),
            "user_id": current_user.id
        })
        if not chat_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
    else:
        # Create new session
        chat_session = {
            "_id": ObjectId(),
            "user_id": current_user.id,
            "messages": []
        }
        await db.chat_sessions.insert_one(chat_session)
    
    # Add user message to session
    user_message = ChatMessage(role="user", content=message)
    chat_session["messages"].append(user_message.dict())
    
    # Prepare context for AI
    system_message = """
    You are an AI shopping concierge for AisleMarts, a mobile marketplace. 
    Help customers find products, answer questions about orders, and provide shopping assistance.
    Be helpful, friendly, and concise. If you need specific product information, 
    you can search the product catalog.
    """
    
    # Prepare messages for OpenAI API
    messages = [{"role": "system", "content": system_message}]
    
    # Add conversation history (last 10 messages to keep context manageable)
    for msg in chat_session["messages"][-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    try:
        # Get AI response
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # Add AI response to session
        ai_message = ChatMessage(role="assistant", content=ai_response)
        chat_session["messages"].append(ai_message.dict())
        
        # Update session in database
        await db.chat_sessions.update_one(
            {"_id": chat_session["_id"]},
            {"$set": {"messages": chat_session["messages"]}}
        )
        
        return {
            "response": ai_response,
            "session_id": str(chat_session["_id"])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )

@router.get("/sessions", response_model=List[dict])
async def get_chat_sessions(
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    sessions = await db.chat_sessions.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).to_list(length=20)
    
    # Return session summaries
    session_summaries = []
    for session in sessions:
        summary = {
            "id": str(session["_id"]),
            "created_at": session["created_at"],
            "message_count": len(session["messages"]),
            "last_message": session["messages"][-1]["content"][:100] + "..." if session["messages"] else ""
        }
        session_summaries.append(summary)
    
    return session_summaries

@router.get("/sessions/{session_id}", response_model=ChatSession)
async def get_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(session_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session ID"
        )
    
    session = await db.chat_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user.id
    })
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return ChatSession(**session)

@router.delete("/sessions/{session_id}", response_model=dict)
async def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(session_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session ID"
        )
    
    result = await db.chat_sessions.delete_one({
        "_id": ObjectId(session_id),
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return {"message": "Chat session deleted successfully"}

@router.post("/recommendations", response_model=List[dict])
async def get_ai_recommendations(
    query: str = "general",
    category: str = None,
    price_range: str = None,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    """Get AI-powered product recommendations"""
    
    # Build product filter
    filter_query = {"status": "active"}
    if category:
        filter_query["category"] = category
    
    # Get products
    products = await db.products.find(filter_query).limit(50).to_list(length=50)
    
    if not products:
        return []
    
    # Prepare product descriptions for AI
    product_descriptions = []
    for product in products:
        desc = f"{product['name']}: {product['description']} - ${product['price']}"
        product_descriptions.append({
            "id": str(product["_id"]),
            "description": desc,
            "price": product["price"],
            "category": product["category"]
        })
    
    if settings.OPENAI_API_KEY:
        try:
            # Get AI recommendations
            prompt = f"""
            Based on the query "{query}" and the following products, recommend the 5 most relevant products.
            Consider relevance, price, and user preference.
            
            Products: {product_descriptions[:20]}  # Limit to prevent token overflow
            
            Return only the product IDs as a comma-separated list.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.3
            )
            
            # Parse AI response
            recommended_ids = response.choices[0].message.content.strip().split(',')
            recommended_ids = [id.strip() for id in recommended_ids if ObjectId.is_valid(id.strip())]
            
            # Get recommended products
            recommendations = []
            for product_id in recommended_ids[:5]:
                product = await db.products.find_one({"_id": ObjectId(product_id)})
                if product:
                    recommendations.append({
                        "id": str(product["_id"]),
                        "name": product["name"],
                        "description": product["description"],
                        "price": product["price"],
                        "category": product["category"],
                        "images": product.get("images", [])
                    })
            
            return recommendations
            
        except Exception as e:
            # Fallback to simple random selection
            import random
            random_products = random.sample(products, min(5, len(products)))
            return [
                {
                    "id": str(product["_id"]),
                    "name": product["name"],
                    "description": product["description"],
                    "price": product["price"],
                    "category": product["category"],
                    "images": product.get("images", [])
                }
                for product in random_products
            ]
    else:
        # Simple fallback recommendations without AI
        return [
            {
                "id": str(product["_id"]),
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "category": product["category"],
                "images": product.get("images", [])
            }
            for product in products[:5]
        ]

@router.post("/search-assistant", response_model=dict)
async def ai_search_assistant(
    natural_query: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    """Convert natural language query to structured search"""
    
    if not settings.OPENAI_API_KEY:
        # Simple keyword extraction fallback
        keywords = natural_query.lower().split()
        return {
            "search_query": natural_query,
            "suggested_category": None,
            "price_range": None,
            "keywords": keywords
        }
    
    try:
        prompt = f"""
        Convert this natural language shopping query into structured search parameters:
        "{natural_query}"
        
        Return a JSON object with:
        - search_query: cleaned search terms
        - suggested_category: product category if mentioned
        - price_range: if price mentioned (low/medium/high)
        - keywords: array of important keywords
        
        Categories include: electronics, clothing, books, home, sports, beauty, toys
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.3
        )
        
        # Parse the response (simplified - in production, use proper JSON parsing)
        ai_response = response.choices[0].message.content
        
        return {
            "ai_interpretation": ai_response,
            "original_query": natural_query
        }
        
    except Exception as e:
        return {
            "search_query": natural_query,
            "error": "AI processing unavailable",
            "keywords": natural_query.split()
        }