# 🏠 Borrow Nest - Community Sharing Platform

A professional community-based peer-to-peer sharing platform built with the MERN stack, featuring a clean Golden & White UI and AI-powered search capabilities.

## 🌟 Features

### Core Features
- **User Authentication**: Secure JWT-based registration and login
- **Item Management**: Add, edit, delete, and browse community items
- **Borrowing System**: Request-approval workflow for item borrowing
- **Search & Filter**: Traditional search with category filtering
- **Dashboard**: Comprehensive management of items and requests

### 🤖 AI-Powered Search
- **Natural Language Queries**: Search using conversational language
- **Local AI Integration**: Ollama support for offline processing
- **Smart Fallback**: Built-in search when AI is unavailable
- **Free to Use**: No API costs or usage limits

## 🛠️ Tech Stack

- **Frontend**: React.js with professional Golden & White theme
- **Backend**: Node.js + Express.js REST API
- **Database**: MongoDB with in-memory fallback
- **Authentication**: JWT tokens
- **AI**: Ollama (optional) + built-in search

## 📁 Project Structure

```
borrow-nest/
├── frontend/           # React.js application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application pages
│   │   ├── context/    # React context providers
│   │   └── App.js      # Main application
├── backend/            # Node.js API server
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Custom middleware
│   └── server.js       # Express server
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional - uses in-memory database by default)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd borrow-nest
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server: http://localhost:5000
   - Frontend app: http://localhost:3000

### Individual Server Commands

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

**Production build:**
```bash
npm run build
```

## 🔧 Configuration

### Backend Configuration
Create `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_secure_jwt_secret
MONGODB_URI=mongodb://localhost:27017/borrownest
NODE_ENV=development
OLLAMA_URL=http://localhost:11434
```

### Frontend Configuration
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🤖 AI Search Setup (Optional)

### Install Ollama
1. Download from [ollama.ai](https://ollama.ai)
2. Install a model: `ollama pull llama3.2`
3. Start service: `ollama serve`

### Test AI Search
- Navigate to AI Search page
- Try queries like "I need a drill for 2 days"
- Falls back to built-in search if Ollama unavailable

## 📊 Sample Data

The application includes sample data:
- **Users**: john@example.com, jane@example.com, mike@example.com
- **Password**: password123 (for all sample users)
- **Items**: Various tools, electronics, books, and sports equipment

## 🎨 UI Theme

### Golden & White Professional Theme
- **Primary**: Golden (#D4AF37)
- **Secondary**: White (#FFFFFF)
- **Accent**: Light Gold (#F4E4BC)
- **Background**: Cream (#FFF8DC)

### Design Principles
- Clean, professional appearance
- Excellent readability
- Responsive design
- Accessible color contrast
- Modern card-based layout

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create item
- `GET /api/items/my-items` - Get user's items
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Borrowing
- `POST /api/borrow` - Create borrow request
- `GET /api/borrow/my-requests` - Get user's requests
- `GET /api/borrow/received-requests` - Get requests for user's items
- `PUT /api/borrow/:id/status` - Update request status

### Search
- `POST /api/search` - AI-powered search

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set production environment variables:
- `NODE_ENV=production`
- `MONGODB_URI=<production-database-url>`
- `JWT_SECRET=<secure-production-secret>`

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

1. **Port conflicts**: Change ports in environment files
2. **Database connection**: Ensure MongoDB is running or use in-memory option
3. **AI search not working**: Install and start Ollama, or use built-in search
4. **Build errors**: Clear node_modules and reinstall dependencies

### Getting Help

- Check the console for error messages
- Verify all environment variables are set
- Ensure all dependencies are installed
- Test API endpoints individually

---

**Built with modern web technologies for sustainable community sharing** 🌱