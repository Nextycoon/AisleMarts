# 🏪 AisleMarts Week 2 Development Specs - Seller Onboarding & Commission Engine

> **Complete seller experience from registration to first sale with automated 1% commission tracking**

---

## 🎯 **WEEK 2 DEVELOPMENT OBJECTIVES**

### **Primary Goals**
1. **Complete Seller Onboarding Flow**: Registration → Store Setup → First Product → Live Store
2. **Automated Commission Engine**: 1% commission calculation, tracking, and reporting
3. **Seller Dashboard**: Analytics, earnings, product management
4. **M-Pesa Payment Integration**: Kenya-focused mobile money support

### **Success Criteria**
- ✅ Seller can onboard in <10 minutes
- ✅ Commission calculated automatically on every sale
- ✅ M-Pesa payments work end-to-end
- ✅ Seller dashboard shows real-time analytics

---

## 🏪 **SELLER ONBOARDING FLOW - DETAILED SPECS**

### **Phase 1: Account Creation (2 minutes)**

#### **User Story 1.1: Basic Registration**
```
AS A potential seller in Kenya
I WANT TO create an AisleMarts seller account quickly  
SO THAT I can start selling my products globally

ACCEPTANCE CRITERIA:
- Phone number verification (Kenya +254 format)
- Email verification (optional but recommended)
- Password requirements (8+ chars, 1 number, 1 special)
- Terms & conditions acceptance (seller-specific)
- Auto-detect location (Kenya) and set KES currency
```

#### **Backend Implementation**
```python
# New Models (add to models.py)
class SellerProfile(Document):
    user_id: ObjectId = Field(...)
    business_name: str = Field(..., min_length=2, max_length=100)
    business_type: str = Field(...)  # individual, business, company
    phone_number: str = Field(..., regex="^\+254[0-9]{9}$")  # Kenya format
    business_permit: Optional[str] = None  # Business license number
    verification_status: str = Field(default="pending")  # pending, verified, rejected
    m_pesa_number: Optional[str] = None
    tax_pin: Optional[str] = None  # KRA PIN for Kenyan businesses
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Business Details
    business_description: Optional[str] = None
    business_address: Optional[str] = None
    business_city: str = Field(default="Nairobi")
    business_country: str = Field(default="Kenya")
    
    # Seller Preferences
    preferred_currency: str = Field(default="KES")
    commission_rate: float = Field(default=0.01)  # 1%
    auto_payout: bool = Field(default=True)
    
    class Settings:
        collection = "seller_profiles"

class SellerStore(Document):
    seller_id: ObjectId = Field(...)
    store_name: str = Field(..., min_length=3, max_length=50)
    store_slug: str = Field(..., unique=True)  # URL-friendly store name
    store_description: Optional[str] = None
    store_logo: Optional[str] = None  # Base64 or URL
    store_banner: Optional[str] = None
    
    # Store Settings
    is_active: bool = Field(default=True)
    store_categories: List[str] = Field(default=[])
    shipping_policy: Optional[str] = None
    return_policy: Optional[str] = None
    
    # Localization
    store_country: str = Field(default="Kenya")
    store_currency: str = Field(default="KES")
    store_language: str = Field(default="en")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        collection = "seller_stores"
```

#### **Frontend Components**
```typescript
// New Components: /src/components/seller/
// SellerRegistrationWizard.tsx
interface SellerRegistrationProps {
  onComplete: (sellerId: string) => void;
  onCancel: () => void;
}

const SellerRegistrationWizard: React.FC<SellerRegistrationProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'individual',
    phoneNumber: '+254',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const steps = [
    { title: 'Business Info', component: BusinessInfoStep },
    { title: 'Contact Details', component: ContactDetailsStep },
    { title: 'Account Setup', component: AccountSetupStep },
    { title: 'Verification', component: VerificationStep }
  ];

  // Step progression logic
  // Form validation
  // API integration
  // Success handling
};
```

### **Phase 2: Business Verification (3 minutes)**

#### **User Story 1.2: Business Details**
```
AS A new seller
I WANT TO provide my business details for verification
SO THAT buyers trust my store and I can receive payments

ACCEPTANCE CRITERIA:
- Business name (required)
- Business type selection (Individual, Small Business, Company)
- Business permit number (optional, recommended)
- M-Pesa business number (required for payments)
- Business description (optional)
- Auto-generate store slug from business name
```

#### **Verification Flow**
```python
# New Service: seller_verification_service.py
class SellerVerificationService:
    def __init__(self):
        pass
    
    async def verify_phone_number(self, phone_number: str) -> bool:
        """Send SMS verification code to phone number"""
        # Integrate with SMS service (Africa's Talking or Twilio)
        pass
    
    async def verify_business_permit(self, permit_number: str, country: str) -> dict:
        """Verify business permit with government database"""
        # For Kenya: integrate with eCitizen API
        # For now: manual verification flag
        return {
            "status": "pending_manual_review",
            "estimated_completion": "24 hours"
        }
    
    async def verify_m_pesa_number(self, m_pesa_number: str) -> bool:
        """Verify M-Pesa number is valid business account"""
        # Integrate with Safaricom M-Pesa API
        # For now: format validation
        return m_pesa_number.startswith('+254') and len(m_pesa_number) == 13
    
    async def calculate_trust_score(self, seller_profile: SellerProfile) -> float:
        """Calculate initial trust score based on verification"""
        score = 50.0  # Base score
        
        if seller_profile.phone_number:
            score += 20.0
        if seller_profile.business_permit:
            score += 15.0
        if seller_profile.m_pesa_number:
            score += 10.0
        if seller_profile.business_description:
            score += 5.0
            
        return min(score, 100.0)
```

### **Phase 3: Store Setup (3 minutes)**

#### **User Story 1.3: Store Creation**
```
AS A verified seller
I WANT TO set up my online store easily
SO THAT I can start listing products immediately

ACCEPTANCE CRITERIA:
- Store name (auto-suggested from business name)
- Store description (with character counter)
- Store logo upload (optional, with default avatar)
- Store categories selection (from predefined list)
- Store URL preview (aislemarts.com/store/store-slug)
- Shipping and return policies (templates provided)
```

#### **Store Setup Component**
```typescript
// StoreSetupWizard.tsx
interface StoreSetupData {
  storeName: string;
  storeDescription: string;
  storeLogo: string | null;
  categories: string[];
  shippingPolicy: string;
  returnPolicy: string;
}

const StoreSetupWizard: React.FC = () => {
  const [storeData, setStoreData] = useState<StoreSetupData>({
    storeName: '',
    storeDescription: '',
    storeLogo: null,
    categories: [],
    shippingPolicy: 'standard_template',
    returnPolicy: 'standard_template'
  });

  // Category selection from AisleMarts categories
  const availableCategories = [
    'Electronics', 'Fashion', 'Home & Living', 'Beauty',
    'Books & Education', 'Sports', 'Automotive', 'Health'
  ];

  // Policy templates
  const policyTemplates = {
    shipping: {
      standard: "Orders processed within 1-2 business days. Delivery within Nairobi: 1-2 days. Outside Nairobi: 3-5 days.",
      express: "Express shipping available. Same-day delivery in Nairobi CBD.",
      pickup: "Pickup available at our location in [City]."
    },
    return: {
      standard: "30-day return policy. Items must be unused and in original packaging.",
      no_return: "All sales final. No returns accepted.",
      custom: "Custom return policy (seller to specify)"
    }
  };
};
```

### **Phase 4: First Product (2 minutes)**

#### **User Story 1.4: Quick Product Upload**
```
AS A new seller with a store
I WANT TO add my first product quickly
SO THAT my store goes live with something to sell

ACCEPTANCE CRITERIA:
- Product name (required)
- Product description (with rich text editor)
- Product price in KES (with USD conversion preview)
- Product images (up to 5, with drag-and-drop)
- Product category (from store categories)
- Stock quantity (optional, defaults to "In Stock")
- Instant preview of product page
```

#### **Quick Product Upload**
```typescript
// QuickProductUpload.tsx
interface QuickProductData {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  stockQuantity: number;
  isActive: boolean;
}

const QuickProductUpload: React.FC = () => {
  const [productData, setProductData] = useState<QuickProductData>({
    name: '',
    description: '',
    price: 0,
    currency: 'KES',
    images: [],
    category: '',
    stockQuantity: 1,
    isActive: true
  });

  // Auto-convert price to other currencies for preview
  const [pricePreview, setPricePreview] = useState({
    USD: 0,
    EUR: 0,
    GBP: 0
  });

  // Image handling (base64 or upload to storage)
  const handleImageUpload = (files: FileList) => {
    // Convert to base64 or upload to cloud storage
    // Update productData.images array
  };

  // Real-time price conversion
  useEffect(() => {
    if (productData.price > 0) {
      localizationService.convertPrice(productData.price, 'KES', 'USD')
        .then(conversion => setPricePreview(prev => ({...prev, USD: conversion.amount})));
    }
  }, [productData.price]);
};
```

---

## 💰 **COMMISSION ENGINE - DETAILED SPECS**

### **Commission Calculation System**

#### **User Story 2.1: Automatic Commission Calculation**
```
AS THE SYSTEM
I WANT TO automatically calculate 1% commission on every sale
SO THAT sellers are charged fairly and AisleMarts earns revenue

ACCEPTANCE CRITERIA:
- 1% commission on gross sale amount (before shipping)
- Commission calculated in seller's currency (KES for Kenya)
- Commission deducted from seller payout
- Real-time commission tracking per seller
- Monthly commission reporting
```

#### **Commission Models**
```python
# Add to models.py
class Commission(Document):
    order_id: ObjectId = Field(...)
    seller_id: ObjectId = Field(...)
    buyer_id: ObjectId = Field(...)
    
    # Transaction Details
    gross_amount: float = Field(...)  # Total order value
    commission_rate: float = Field(default=0.01)  # 1%
    commission_amount: float = Field(...)  # Calculated commission
    seller_payout: float = Field(...)  # Amount seller receives
    
    # Currency Information
    currency: str = Field(...)
    exchange_rate: Optional[float] = None  # If conversion needed
    
    # Status Tracking
    status: str = Field(default="pending")  # pending, processed, paid
    processed_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    
    # Payment Details
    payment_method: str = Field(...)  # m_pesa, bank_transfer
    payment_reference: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        collection = "commissions"

class SellerPayout(Document):
    seller_id: ObjectId = Field(...)
    payout_period: str = Field(...)  # "2024-01", "2024-02"
    
    # Payout Summary
    total_sales: float = Field(...)
    total_commission: float = Field(...)
    net_payout: float = Field(...)
    currency: str = Field(...)
    
    # Individual Transactions
    commission_ids: List[ObjectId] = Field(default=[])
    
    # Payout Details
    payout_method: str = Field(...)  # m_pesa, bank_transfer
    payout_reference: Optional[str] = None
    payout_status: str = Field(default="pending")  # pending, processing, completed, failed
    
    # Timing
    period_start: datetime = Field(...)
    period_end: datetime = Field(...)
    payout_date: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        collection = "seller_payouts"
```

#### **Commission Service**
```python
# New file: commission_service.py
from typing import Dict, List
from datetime import datetime, timedelta
from models import Commission, SellerPayout, Order
from localization_service import localization_service

class CommissionService:
    def __init__(self):
        self.default_commission_rate = 0.01  # 1%
    
    async def calculate_commission(self, order: Order) -> Commission:
        """Calculate commission for a completed order"""
        
        # Get seller's commission rate (default 1%)
        commission_rate = self.default_commission_rate
        
        # Calculate amounts
        gross_amount = order.total_amount
        commission_amount = gross_amount * commission_rate
        seller_payout = gross_amount - commission_amount
        
        # Create commission record
        commission = Commission(
            order_id=order.id,
            seller_id=order.seller_id,
            buyer_id=order.buyer_id,
            gross_amount=gross_amount,
            commission_rate=commission_rate,
            commission_amount=round(commission_amount, 2),
            seller_payout=round(seller_payout, 2),
            currency=order.currency,
            payment_method=order.payment_method,
            status="pending"
        )
        
        await commission.insert()
        return commission
    
    async def process_commission(self, commission_id: ObjectId) -> bool:
        """Mark commission as processed (order completed)"""
        commission = await Commission.get(commission_id)
        if commission:
            commission.status = "processed"
            commission.processed_at = datetime.utcnow()
            await commission.save()
            return True
        return False
    
    async def get_seller_earnings(self, seller_id: ObjectId, period: str = "current_month") -> Dict:
        """Get seller's earnings summary"""
        
        # Calculate date range
        now = datetime.utcnow()
        if period == "current_month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        elif period == "last_month":
            last_month = now.replace(day=1) - timedelta(days=1)
            start_date = last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = last_month.replace(day=last_month.day, hour=23, minute=59, second=59)
        
        # Query commissions for period
        commissions = await Commission.find({
            "seller_id": seller_id,
            "created_at": {"$gte": start_date, "$lte": end_date},
            "status": {"$in": ["processed", "paid"]}
        }).to_list()
        
        # Calculate totals
        total_sales = sum(c.gross_amount for c in commissions)
        total_commission = sum(c.commission_amount for c in commissions)
        net_earnings = sum(c.seller_payout for c in commissions)
        
        return {
            "period": period,
            "total_sales": total_sales,
            "total_commission": total_commission,
            "net_earnings": net_earnings,
            "transaction_count": len(commissions),
            "currency": commissions[0].currency if commissions else "KES",
            "commission_rate": self.default_commission_rate * 100  # 1%
        }
    
    async def generate_monthly_payout(self, seller_id: ObjectId, year: int, month: int) -> SellerPayout:
        """Generate monthly payout for seller"""
        
        # Calculate period dates
        period_start = datetime(year, month, 1)
        if month == 12:
            period_end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
        else:
            period_end = datetime(year, month + 1, 1) - timedelta(seconds=1)
        
        period_str = f"{year}-{month:02d}"
        
        # Get all processed commissions for the period
        commissions = await Commission.find({
            "seller_id": seller_id,
            "created_at": {"$gte": period_start, "$lte": period_end},
            "status": "processed"
        }).to_list()
        
        if not commissions:
            return None
        
        # Calculate payout totals
        total_sales = sum(c.gross_amount for c in commissions)
        total_commission = sum(c.commission_amount for c in commissions)
        net_payout = sum(c.seller_payout for c in commissions)
        
        # Create payout record
        payout = SellerPayout(
            seller_id=seller_id,
            payout_period=period_str,
            total_sales=total_sales,
            total_commission=total_commission,
            net_payout=net_payout,
            currency=commissions[0].currency,
            commission_ids=[c.id for c in commissions],
            payout_method="m_pesa",  # Default for Kenya
            period_start=period_start,
            period_end=period_end
        )
        
        await payout.insert()
        
        # Mark commissions as paid
        for commission in commissions:
            commission.status = "paid"
            commission.paid_at = datetime.utcnow()
            await commission.save()
        
        return payout

# Initialize service
commission_service = CommissionService()
```

### **Commission API Routes**

#### **Commission Endpoints**
```python
# New file: commission_routes.py
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Optional
from commission_service import commission_service
from auth import get_current_seller

router = APIRouter(prefix="/api/commission", tags=["Commission"])

@router.get("/earnings/{seller_id}")
async def get_seller_earnings(
    seller_id: str,
    period: str = "current_month",
    current_seller: dict = Depends(get_current_seller)
):
    """Get seller's earnings summary"""
    try:
        earnings = await commission_service.get_seller_earnings(
            ObjectId(seller_id), 
            period
        )
        return earnings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/commissions/{seller_id}")
async def get_seller_commissions(
    seller_id: str,
    limit: int = 50,
    offset: int = 0,
    current_seller: dict = Depends(get_current_seller)
):
    """Get seller's commission history"""
    try:
        commissions = await Commission.find({
            "seller_id": ObjectId(seller_id)
        }).skip(offset).limit(limit).to_list()
        
        return {
            "commissions": [
                {
                    "id": str(c.id),
                    "order_id": str(c.order_id),
                    "gross_amount": c.gross_amount,
                    "commission_amount": c.commission_amount,
                    "seller_payout": c.seller_payout,
                    "currency": c.currency,
                    "status": c.status,
                    "created_at": c.created_at,
                    "processed_at": c.processed_at
                }
                for c in commissions
            ],
            "total_count": len(commissions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/payout/{seller_id}")
async def generate_payout(
    seller_id: str,
    year: int,
    month: int,
    current_seller: dict = Depends(get_current_seller)
):
    """Generate monthly payout for seller"""
    try:
        payout = await commission_service.generate_monthly_payout(
            ObjectId(seller_id), 
            year, 
            month
        )
        
        if not payout:
            raise HTTPException(status_code=404, detail="No transactions found for this period")
        
        return {
            "payout_id": str(payout.id),
            "period": payout.payout_period,
            "net_payout": payout.net_payout,
            "currency": payout.currency,
            "status": payout.payout_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 📱 **M-PESA INTEGRATION SPECS**

### **M-Pesa Payment Flow**

#### **User Story 3.1: M-Pesa Checkout**
```
AS A buyer in Kenya
I WANT TO pay with M-Pesa easily
SO THAT I can complete purchases with my mobile money

ACCEPTANCE CRITERIA:
- M-Pesa option prominently displayed at checkout
- Phone number entry with +254 format validation
- STK push notification sent to buyer's phone
- Real-time payment status updates
- Automatic order confirmation on successful payment
```

#### **M-Pesa Service Implementation**
```python
# New file: mpesa_service.py
import requests
import base64
from datetime import datetime
from typing import Dict, Optional
import os

class MPesaService:
    def __init__(self):
        # Safaricom M-Pesa API credentials (use environment variables)
        self.consumer_key = os.getenv("MPESA_CONSUMER_KEY")
        self.consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
        self.business_short_code = os.getenv("MPESA_BUSINESS_SHORT_CODE", "174379")
        self.passkey = os.getenv("MPESA_PASSKEY")
        self.callback_url = os.getenv("MPESA_CALLBACK_URL", "https://yourdomain.com/api/mpesa/callback")
        
        # API URLs (sandbox)
        self.base_url = "https://sandbox.safaricom.co.ke"
        self.token_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        self.stk_push_url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
    
    async def get_access_token(self) -> str:
        """Get OAuth access token from Safaricom"""
        credentials = base64.b64encode(
            f"{self.consumer_key}:{self.consumer_secret}".encode()
        ).decode()
        
        headers = {
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(self.token_url, headers=headers)
        
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            raise Exception(f"Failed to get M-Pesa access token: {response.text}")
    
    async def initiate_stk_push(
        self, 
        phone_number: str, 
        amount: float, 
        order_id: str,
        description: str = "AisleMarts Purchase"
    ) -> Dict:
        """Initiate STK push payment request"""
        
        # Get access token
        access_token = await self.get_access_token()
        
        # Generate timestamp and password
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(
            f"{self.business_short_code}{self.passkey}{timestamp}".encode()
        ).decode()
        
        # Format phone number (remove + and spaces)
        formatted_phone = phone_number.replace("+", "").replace(" ", "")
        if not formatted_phone.startswith("254"):
            if formatted_phone.startswith("0"):
                formatted_phone = "254" + formatted_phone[1:]
        
        # STK push payload
        payload = {
            "BusinessShortCode": self.business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),  # M-Pesa requires integer
            "PartyA": formatted_phone,
            "PartyB": self.business_short_code,
            "PhoneNumber": formatted_phone,
            "CallBackURL": self.callback_url,
            "AccountReference": order_id,
            "TransactionDesc": description
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(self.stk_push_url, json=payload, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            return {
                "status": "success",
                "checkout_request_id": result.get("CheckoutRequestID"),
                "merchant_request_id": result.get("MerchantRequestID"),
                "response_code": result.get("ResponseCode"),
                "response_description": result.get("ResponseDescription")
            }
        else:
            return {
                "status": "error",
                "error": response.text
            }
    
    async def query_payment_status(self, checkout_request_id: str) -> Dict:
        """Query the status of STK push payment"""
        # Implementation for payment status query
        # This would call M-Pesa query API
        pass

# Initialize service
mpesa_service = MPesaService()
```

#### **M-Pesa Routes**
```python
# New file: mpesa_routes.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from mpesa_service import mpesa_service
from commission_service import commission_service

router = APIRouter(prefix="/api/mpesa", tags=["M-Pesa"])

class MPesaPaymentRequest(BaseModel):
    phone_number: str
    amount: float
    order_id: str
    description: str = "AisleMarts Purchase"

@router.post("/initiate-payment")
async def initiate_mpesa_payment(payment_request: MPesaPaymentRequest):
    """Initiate M-Pesa STK push payment"""
    try:
        result = await mpesa_service.initiate_stk_push(
            phone_number=payment_request.phone_number,
            amount=payment_request.amount,
            order_id=payment_request.order_id,
            description=payment_request.description
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/callback")
async def mpesa_callback(request: Request):
    """Handle M-Pesa payment callback"""
    try:
        callback_data = await request.json()
        
        # Extract payment details from callback
        result_code = callback_data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
        
        if result_code == 0:  # Success
            # Payment successful
            checkout_request_id = callback_data["Body"]["stkCallback"]["CheckoutRequestID"]
            
            # Update order status, calculate commission, etc.
            # This would integrate with your order management system
            
            return {"status": "success", "message": "Payment processed"}
        else:
            # Payment failed
            return {"status": "failed", "message": "Payment failed"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/payment-status/{checkout_request_id}")
async def check_payment_status(checkout_request_id: str):
    """Check M-Pesa payment status"""
    try:
        status = await mpesa_service.query_payment_status(checkout_request_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 📊 **SELLER DASHBOARD SPECS**

### **Dashboard Components**

#### **User Story 4.1: Seller Analytics Dashboard**
```
AS A seller
I WANT TO see my store performance at a glance
SO THAT I can understand my business and make improvements

ACCEPTANCE CRITERIA:
- Total sales (current month, previous month)
- Commission breakdown (transparent calculation)
- Top-performing products
- Recent orders with status
- Earnings to be paid out
- Store performance metrics (views, conversions)
```

#### **Seller Dashboard React Component**
```typescript
// SellerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { localizationService } from '../services/LocalizationService';
import { commissionService } from '../services/CommissionService';

interface SellerDashboardData {
  earnings: {
    currentMonth: number;
    previousMonth: number;
    totalCommission: number;
    netEarnings: number;
    currency: string;
  };
  orders: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    recentOrders: Order[];
  };
  products: {
    totalProducts: number;
    activeProducts: number;
    topProducts: Product[];
  };
  analytics: {
    storeViews: number;
    conversionRate: number;
    averageOrderValue: number;
  };
}

const SellerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load earnings data
      const earnings = await commissionService.getSellerEarnings(selectedPeriod);
      
      // Load orders data
      const orders = await orderService.getSellerOrders();
      
      // Load products data
      const products = await productService.getSellerProducts();
      
      // Load analytics
      const analytics = await analyticsService.getStoreAnalytics();
      
      setDashboardData({
        earnings,
        orders,
        products,
        analytics
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return localizationService.formatPrice(amount, currency);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Earnings Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Earnings Overview</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="This Month"
            value={formatCurrency(dashboardData.earnings.currentMonth)}
            change={calculateChange(dashboardData.earnings.currentMonth, dashboardData.earnings.previousMonth)}
          />
          <MetricCard
            title="Commission Paid"
            value={formatCurrency(dashboardData.earnings.totalCommission)}
            subtitle="1% of sales"
          />
          <MetricCard
            title="Net Earnings"
            value={formatCurrency(dashboardData.earnings.netEarnings)}
            subtitle="After commission"
          />
        </View>
      </View>

      {/* Orders Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Orders</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Orders"
            value={dashboardData.orders.totalOrders.toString()}
          />
          <MetricCard
            title="Pending"
            value={dashboardData.orders.pendingOrders.toString()}
            urgent={dashboardData.orders.pendingOrders > 0}
          />
          <MetricCard
            title="Completed"
            value={dashboardData.orders.completedOrders.toString()}
          />
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕒 Recent Orders</Text>
        {dashboardData.orders.recentOrders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </View>

      {/* Top Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Top Products</Text>
        {dashboardData.products.topProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>

      {/* Store Analytics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Store Performance</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Store Views"
            value={dashboardData.analytics.storeViews.toString()}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${dashboardData.analytics.conversionRate.toFixed(1)}%`}
          />
          <MetricCard
            title="Avg. Order Value"
            value={formatCurrency(dashboardData.analytics.averageOrderValue)}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
```

---

## ✅ **WEEK 2 DELIVERABLES CHECKLIST**

### **Backend Development**
- [ ] **Seller Profile & Store Models** (Day 1)
- [ ] **Seller Registration API** (Day 1-2)
- [ ] **Business Verification Service** (Day 2)
- [ ] **Commission Calculation Engine** (Day 2-3)
- [ ] **M-Pesa Integration Service** (Day 3-4)
- [ ] **Commission API Routes** (Day 4)
- [ ] **Seller Dashboard APIs** (Day 4-5)

### **Frontend Development**
- [ ] **Seller Registration Wizard** (Day 1-2)
- [ ] **Store Setup Components** (Day 2-3)
- [ ] **Quick Product Upload** (Day 3)
- [ ] **Seller Dashboard** (Day 3-4)
- [ ] **M-Pesa Checkout Flow** (Day 4-5)
- [ ] **Commission Tracking UI** (Day 5)

### **Integration & Testing**
- [ ] **End-to-End Seller Onboarding** (Day 5)
- [ ] **Commission Calculation Testing** (Day 5)
- [ ] **M-Pesa Sandbox Testing** (Day 6)
- [ ] **Dashboard Data Integration** (Day 6)
- [ ] **Mobile Responsiveness** (Day 6-7)

### **Documentation & Training**
- [ ] **Seller Onboarding Guide** (Day 6)
- [ ] **Commission System Documentation** (Day 6)
- [ ] **M-Pesa Integration Guide** (Day 7)
- [ ] **Seller Training Materials** (Day 7)

---

## 🎯 **SUCCESS CRITERIA FOR WEEK 2**

### **Technical Success**
- ✅ **Seller can complete onboarding in <10 minutes**
- ✅ **Commission calculated automatically on every sale**
- ✅ **M-Pesa payments work end-to-end (sandbox)**
- ✅ **Seller dashboard shows real-time data**
- ✅ **Mobile-first experience on all devices**

### **Business Success**
- ✅ **First 10 sellers successfully onboarded**
- ✅ **Commission system tested with sample transactions**
- ✅ **Seller feedback collected and incorporated**
- ✅ **Kenya seller recruitment materials prepared**
- ✅ **Week 3 pilot launch ready**

---

**STATUS: 📋 WEEK 2 DEVELOPMENT SPECS COMPLETE - READY FOR IMPLEMENTATION!** 🚀

*Complete seller experience from registration to first sale with automated commission tracking* 💙