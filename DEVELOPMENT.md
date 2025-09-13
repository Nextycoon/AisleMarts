# Development Guide

## Getting Started

### 1. Environment Setup
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit the .env file with your settings:
# - Add your OpenAI API key for AI features
# - Add your Stripe keys for payment processing
# - Update MongoDB connection if needed
```

### 2. Start Development Services
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start services individually:

# Backend only
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend only  
cd frontend
npm install
npm start
```

### 3. Initialize Database
```bash
cd backend
python init_db.py
```

### 4. Access Services
- API Documentation: http://localhost:8000/docs
- Expo DevTools: http://localhost:19000
- MongoDB: localhost:27017

## Development Workflow

### Backend Development
1. API endpoints are in `backend/app/routes/`
2. Database models in `backend/app/models/`
3. Business logic in `backend/app/services/`
4. Test endpoints with the auto-generated docs at `/docs`

### Frontend Development
1. Screens are in `frontend/src/screens/`
2. Components in `frontend/src/components/`
3. API calls in `frontend/src/services/`
4. State management in `frontend/src/store/`

### Testing the Application

#### 1. Create a User Account
- Open the mobile app in Expo Go or simulator
- Register a new account
- Login with your credentials

#### 2. Test Vendor Features
- Register as a vendor in the profile screen
- Create products
- Manage inventory

#### 3. Test Shopping Features
- Browse products
- Add items to cart
- Test checkout flow (requires Stripe setup)

#### 4. Test AI Features
- Chat with the AI assistant
- Try natural language search
- Get product recommendations

## Key Features Implemented

### ✅ Authentication
- JWT-based auth with secure storage
- User registration and login
- Role-based access control

### ✅ Product Catalog
- Full CRUD operations for products
- Category filtering
- Search functionality
- Image support

### ✅ Shopping Cart
- Add/remove items
- Quantity management
- Persistent cart storage

### ✅ Vendor System
- Vendor onboarding
- Product management
- Dashboard analytics

### ✅ AI Integration
- OpenAI chat assistant
- Product recommendations
- Natural language search

### ✅ Payment Processing
- Stripe integration
- Order management
- Payment confirmation

## API Usage Examples

### Authentication
```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Products
```bash
# Get products
curl "http://localhost:8000/api/products/"

# Search products
curl "http://localhost:8000/api/products/?search=laptop&category=electronics"
```

### AI Assistant
```bash
# Chat with AI
curl -X POST "http://localhost:8000/api/ai/chat?message=I need a gift for my mom" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file

2. **Frontend Won't Start**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

3. **Backend Import Errors**
   - Ensure you're in the correct directory
   - Check Python path and virtual environment

4. **AI Features Not Working**
   - Add your OpenAI API key to .env file
   - Verify the key is valid and has credits

5. **Payment Processing Issues**
   - Add Stripe keys to .env file
   - Use test keys for development

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# View logs
docker-compose logs backend
docker-compose logs frontend
```

## Next Steps for Development

1. **Enhance UI Components**
   - Complete the remaining screens
   - Add loading states and error handling
   - Implement responsive design

2. **Add Testing**
   - Unit tests for backend endpoints
   - Integration tests for API
   - Frontend component testing

3. **Improve AI Features**
   - Add more sophisticated recommendations
   - Implement conversation memory
   - Add voice interface

4. **Production Preparation**
   - Environment-specific configurations
   - Security hardening
   - Performance optimization
   - Monitoring and logging