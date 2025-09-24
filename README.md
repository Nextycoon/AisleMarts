# AisleMarts

AisleMarts is a comprehensive mobile-first AI-powered marketplace platform built with modern technologies. The platform enables vendors to sell products and customers to shop with AI assistance.

## 🏗️ Architecture

### Technology Stack

**Frontend (Mobile)**
- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **UI Components**: Custom components with React Native

**Backend (API)**
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment Processing**: Stripe
- **AI Integration**: OpenAI GPT

**Development Environment**
- **Containerization**: Docker & Docker Compose
- **Database**: MongoDB 7.0

## 🚀 Features

### Core Functionality

#### 🔐 Authentication System
- User registration and login
- JWT-based authentication
- Role-based access control (Customer, Vendor, Admin)
- Secure token storage

#### 🏪 Vendor Onboarding
- Vendor profile creation and management
- Business verification workflow
- Vendor dashboard with analytics
- Product management interface

#### 📦 Product Catalog
- Product CRUD operations
- Category management
- Advanced search and filtering
- Product image management
- Inventory tracking

#### 🛒 Shopping Cart
- Add/remove items
- Quantity management
- Cart persistence across sessions
- Real-time total calculation

#### 💳 Checkout & Orders
- Stripe payment integration
- Order processing workflow
- Order history and tracking
- Shipping address management

#### 🤖 AI Concierge
- OpenAI-powered chat assistant
- Product recommendations
- Natural language search
- Personalized shopping assistance

## 📁 Project Structure

```
AisleMarts/
├── apps/                       # Other services
│   ├── api/                    # Example API service
│   └── mobile/                 # Example mobile app
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── config/            # Configuration files
│   │   ├── models/            # Pydantic models
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── main.py           # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Backend container
├── frontend/                  # Expo React Native app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── navigation/       # Navigation configuration
│   │   ├── screens/          # Screen components
│   │   ├── services/         # API services
│   │   ├── store/           # Redux store and slices
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── package.json         # Node.js dependencies
│   └── Dockerfile.dev       # Frontend container
├── docker-compose.yml        # Multi-container setup
└── README.md                # Project documentation
```

## 🛠️ Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AisleMarts
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

4. **Access the services**
   - Frontend (Expo): http://localhost:19000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - MongoDB: localhost:27017

### Local Development Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=aislemarts

# JWT Authentication
SECRET_KEY=your-secure-secret-key-here  # Will auto-generate if not set
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Stripe Payment (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OpenAI Integration (Optional)
OPENAI_API_KEY=sk-your-openai-api-key

# Environment
ENVIRONMENT=development
```

> **Security Note**: If `SECRET_KEY` is not provided or uses the default value, a secure key will be automatically generated. For production deployments, always set a strong, unique `SECRET_KEY` environment variable.

## 📱 Mobile App Features

### Authentication Flow
- Login/Register screens
- Secure token storage with Expo SecureStore
- Automatic session restoration

### Main Navigation
- **Home**: Featured products, categories, AI assistant access
- **Search**: Product search with AI-powered suggestions
- **Cart**: Shopping cart management
- **Orders**: Order history and tracking
- **Profile**: User profile and settings

### Key Components
- **ProductCard**: Reusable product display component
- **Button**: Customizable button component
- **Input**: Form input with validation
- **Navigation**: Stack and tab navigation setup

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products/` - List products
- `POST /api/products/` - Create product (vendor only)
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product (vendor only)

### Cart
- `GET /api/cart/` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{product_id}` - Update cart item
- `DELETE /api/cart/items/{product_id}` - Remove from cart

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/` - Get user orders
- `GET /api/orders/{id}` - Get order details

### AI Concierge
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/recommendations` - Get AI product recommendations

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with Pydantic
- Secure environment variable handling

## 🧪 Testing

### Backend Testing
To run the backend tests, navigate to the `backend` directory and run `pytest`.

```bash
cd backend
export PYTHONPATH=.
pytest
```

### Frontend Testing
To run the frontend tests, navigate to the `frontend` directory and run `npm test`.

```bash
cd frontend
npm test
```

## 📦 Deployment

### Production Environment Variables
Update the following for production:

```env
SECRET_KEY=generate-a-strong-secret-key
MONGODB_URL=mongodb://production-db-url
ENVIRONMENT=production
```

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs` endpoint
- Review the code comments and type definitions

## 🚀 Future Enhancements

- Real-time notifications
- Social commerce features
- Advanced analytics dashboard
- Multi-language support
- Progressive Web App (PWA) support
- Advanced AI features (image recognition, voice commands)
- Integration with more payment providers
