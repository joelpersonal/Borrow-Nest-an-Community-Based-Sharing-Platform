# 🏠 Borrow Nest

A community-centric peer-to-peer product borrowing platform built with the MERN stack, featuring an offline AI-powered search assistant using Ollama.

## 🌟 Features

### Core Features
- **User Authentication**: JWT-based registration and login
- **Item Management**: Add, edit, delete, and browse items
- **Borrowing System**: Request to borrow items with approval workflow
- **Search & Filter**: Traditional keyword search and category filtering
- **Dashboard**: Manage your items and borrow requests

### 🤖 AI-Powered Search (100% Free & Offline)
- **Natural Language Queries**: Search using conversational language
- **Ollama Integration**: Powered by free local LLM (no internet required)
- **Built-in Smart AI**: Always-available fallback AI system
- **Zero Cost**: No API keys, subscriptions, or usage limits
- **Privacy First**: All AI processing happens on your computer

## 🛠️ Tech Stack

- **Frontend**: React.js with vanilla CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: Ollama (Free Local LLM) + Built-in Smart AI

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **Ollama** (for AI search functionality)

### Installing Ollama

1. **Download Ollama**: Visit [ollama.ai](https://ollama.ai) and download for your OS
2. **Install a model**: After installation, run:
   ```bash
   ollama pull llama3.2
   ```
3. **Start Ollama**: The service should start automatically, or run:
   ```bash
   ollama serve
   ```

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd borrow-nest
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/borrownest
JWT_SECRET=your_super_secret_jwt_key_here
OLLAMA_URL=http://localhost:11434
NODE_ENV=development
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### 6. Start the Application

#### Development Mode (Recommended)
```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start React frontend
cd client
npm start
```

#### Production Mode
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Ollama API**: http://localhost:11434

## 🤖 AI Search Setup

### Testing AI Search
1. Ensure Ollama is running (`ollama serve`)
2. Navigate to the AI Search page in the app
3. Try example queries like:
   - "I need a drill for 2 days"
   - "Any camera available nearby?"
   - "Show me tools for home repair"

### Troubleshooting AI Search
- If AI search shows "Ollama AI is not available", check:
  - Ollama service is running
  - Port 11434 is accessible
  - Model is downloaded (`ollama list`)

## 📱 Usage Guide

### Getting Started
1. **Register**: Create a new account
2. **Add Items**: List items you want to share
3. **Browse**: Explore available items
4. **Search**: Use traditional or AI-powered search
5. **Borrow**: Request items from other users
6. **Manage**: Track requests in your dashboard

### AI Search Examples
- **Specific needs**: "I need a power drill for weekend project"
- **Category search**: "Show me all cooking equipment"
- **Duration-based**: "Camera for 3 days"
- **Purpose-based**: "Tools for home repair"

## 🏗️ Project Structure

```
borrow-nest/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   └── App.js          # Main app component
├── models/                 # MongoDB schemas
├── routes/                 # Express routes
├── middleware/             # Custom middleware
├── server.js              # Express server
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items (with search/filter)
- `POST /api/items` - Create new item
- `GET /api/items/my-items` - Get user's items
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Borrow Requests
- `POST /api/borrow` - Create borrow request
- `GET /api/borrow/my-requests` - Get user's requests
- `GET /api/borrow/received-requests` - Get requests for user's items
- `PUT /api/borrow/:id/status` - Update request status

### AI Search
- `POST /api/ai-search` - AI-powered search

## 🎨 Design System

### Colors
- **Primary Purple**: #5B2D8B
- **Light Purple**: #7B4BAE
- **Dark Purple**: #3F1A5B
- **White**: #ffffff
- **Light Gray**: #f8f9fa

### UI Principles
- Clean, minimal design
- Royal purple accent color
- Responsive layout
- Academic-friendly interface

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected routes
- CORS configuration

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
OLLAMA_URL=http://localhost:11434
```

### Build for Production
```bash
cd client
npm run build
cd ..
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Ollama Not Working**
   - Install Ollama from ollama.ai
   - Pull a model: `ollama pull llama3.2`
   - Start service: `ollama serve`

3. **Port Conflicts**
   - Backend: Change PORT in `.env`
   - Frontend: Change in `client/package.json`

4. **JWT Errors**
   - Generate a strong JWT_SECRET
   - Clear browser localStorage

## 📞 Support

For issues and questions:
1. Check this README
2. Review error logs
3. Ensure all prerequisites are installed
4. Verify environment configuration

---

**Built with ❤️ for sustainable community sharing**