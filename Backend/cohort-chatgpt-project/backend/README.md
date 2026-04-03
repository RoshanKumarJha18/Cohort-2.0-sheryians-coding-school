# Cohort ChatGPT Project - RAG-Powered Knowledge Chatbot

A full-stack, enterprise-grade **Retrieval-Augmented Generation (RAG)** chatbot platform built with Node.js, Express, MongoDB, Pinecone Vector DB, and Google Gemini AI.

---

## 🚀 Overview

This project implements a **smart conversational AI system** that combines:
- **Long-Term Memory (LTM)**: Vector-based semantic search over historical data via Pinecone
- **Short-Term Memory (STM)**: Recent chat context from MongoDB
- **Real-Time Communication**: WebSocket-based Socket.io for live messaging
- **AI-Powered Responses**: Google Gemini API integrated for natural language generation

Unlike basic ChatGPT, this system **retrieves relevant historical knowledge** before generating responses, making it ideal for multi-user enterprise knowledge platforms.

---

## ✨ Key Features

### 🧠 **RAG (Retrieval-Augmented Generation)**
- **Vector Embeddings**: Converts user messages into vector embeddings using Google Gemini
- **Semantic Search**: Retrieves top-3 most relevant past messages from Pinecone vector DB
- **Context-Aware Responses**: Merges retrieved knowledge + recent chat history for accurate answers
- **Multi-User Support**: Each chat session has isolated memory indexed by user + chat ID

### 🔐 **User Authentication & Authorization**
- **JWT-Based Auth**: Secure token generation and validation
- **Password Hashing**: bcrypt encryption for stored credentials
- **Cookie-Based Session Management**: Automatic token refresh via HTTP-only cookies
- **Protected Routes**: All chat endpoints require valid authentication

### 💬 **Real-Time Messaging**
- **WebSocket Events**: Socket.io for instant message delivery
- **Bidirectional Communication**: Client ↔ Server live message streaming
- **Event-Driven Architecture**: Structured socket handlers for messages, connections, and errors
- **Broadcasting**: Messages echoed to connected clients in same chat room

### 📊 **Persistent Storage**
- **MongoDB Integration**: Schemas for users, chats, and messages
- **Indexed Collections**: Fast queries on user, chat, and timestamp fields
- **Document References**: Foreign keys linking users to chat sessions and messages
- **Lean Queries**: Optimized `.lean()` projections for performance

### 🤖 **AI & NLP Services**
- **Vector Generation**: Converts text to embeddings (384-dim vectors)
- **Response Generation**: Google Gemini API for natural language answers
- **System Prompting**: Guides AI to use RAG context intelligently
- **Error Handling**: Graceful fallbacks on API failures

### 🔍 **Vector Database (Pinecone)**
- **Semantic Indexing**: Stores message embeddings with metadata
- **Fast Retrieval**: Sub-second vector similarity search
- **Metadata Filtering**: Queries scoped to user + chat context
- **Dynamic Upserts**: Messages added to vector index on creation

---

## 🏗️ Architecture

### System Flow

```
User Message
    ↓
[Authenticate] → JWT validation + socket auth
    ↓
[Save to DB] → Create message record
    ↓
[Generate Vector] → Convert text to embedding
    ↓
[Retrieve LTM] → Query Pinecone (top-3 similar messages)
    ↓
[Build STM] → Fetch last 20 messages from MongoDB
    ↓
[Construct Prompt] → Merge LTM + STM + system instruction
    ↓
[Generate Response] → Call Google Gemini API
    ↓
[Broadcast] → Send response via Socket.io to client
    ↓
[Store Response] → Save AI message to MongoDB + Pinecone
```

### Component Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Presentation** | Socket.io | Real-time bidirectional communication |
| **API** | Express.js | REST endpoints + middleware |
| **Business Logic** | AI Service, VectorDB Service | Embeddings, prompting, vector queries |
| **Data Persistence** | MongoDB | Users, chats, messages |
| **Vector Search** | Pinecone | Semantic similarity search on embeddings |
| **LLM** | Google Gemini | Natural language generation |
| **Auth** | JWT + bcrypt | Secure user identity + password storage |

---

## 📁 Project Structure

```
cohort-chatgpt-project/
├── server.js                      # Entry point, HTTP server + Socket.io init
├── package.json                   # Dependencies
├── src/
│   ├── app.js                     # Express app configuration
│   ├── controllers/
│   │   ├── auth.controller.js     # Login/signup logic
│   │   └── chat.controller.js     # Chat CRUD operations
│   ├── routes/
│   │   ├── auth.route.js          # POST /api/auth/login, /register
│   │   └── chat.routes.js         # GET/POST /api/chat endpoints
│   ├── middlewares/
│   │   └── auth.middlewares.js    # JWT verification + socket auth
│   ├── models/
│   │   ├── user.model.js          # MongoDB: user schema
│   │   ├── chat.model.js          # MongoDB: chat session schema
│   │   └── message.model.js       # MongoDB: message schema
│   ├── services/
│   │   ├── ai.service.js          # Google Gemini API wrapper
│   │   └── vectordb.service.js    # Pinecone vector DB wrapper
│   ├── sockets/
│   │   └── message.socket.js      # WebSocket event handlers (RAG orchestration)
│   └── db/
│       └── db.js                  # MongoDB connection
├── README.md                      # This file
├── ARCHITECTURE.md                # Detailed system design
├── FEATURES.md                    # Feature breakdown
└── API.md                         # API documentation
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **WebSocket**: Socket.io 4.8.3
- **Database**: MongoDB 9.3.0 (Mongoose)
- **Vector DB**: Pinecone 7.1.0
- **Auth**: JWT + bcrypt 6.0.0
- **AI/LLM**: Google Gemini (@google/genai)
- **Utilities**: dotenv, cookie-parser

### Infrastructure
- **Hosting**: Ready for Heroku, Railway, or any Node.js host
- **Database Hosting**: MongoDB Atlas (cloud)
- **Vector DB Hosting**: Pinecone Cloud
- **AI API**: Google Cloud (Gemini API)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16+
- **MongoDB** (Atlas or local)
- **Pinecone** API key (free tier available)
- **Google Gemini** API key

### Installation

```bash
# 1. Clone repo
git clone <repo-url>
cd cohort-chatgpt-project

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
# Database
MONGODB_URI=your-mongodb-key

# Vector DB
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=chat-embeddings
PINECONE_ENVIRONMENT=us-east-1

# AI API
GOOGLE_GEMINI_KEY=your-gemini-api-key

# JWT
JWT_SECRET=your-secret-key

# Server
NODE_ENV=development
PORT=3000
EOF

# 4. Start server
npm run dev
# Server runs on http://localhost:3000
```

---

## 📡 API Overview

### Authentication Endpoints
```
POST   /api/auth/register          # Create new user
POST   /api/auth/login             # Authenticate user
```

### Chat Endpoints
```
GET    /api/chat/:chatId           # Fetch chat messages
POST   /api/chat                   # Create new chat
GET    /api/chat                   # List user's chats
```

### WebSocket Events
```
user-message                        # Client → Server: Send message
ai-message                         # Server → Client: AI response
chat-history                       # Server → Client: Chat loaded
error                              # Server → Client: Error notification
```

👉 See [API.md](API.md) for complete endpoint documentation.

---

## 🧠 How RAG Works

### 1️⃣ **Vector Generation Phase**
```javascript
// User sends: "What did we discuss about authentication?"
const embedding = await aiservice.generateVector(userMessage);
// Output: 384-dimensional vector [0.45, -0.12, 0.78, ...]
```

### 2️⃣ **Long-Term Memory Retrieval**
```javascript
// Query Pinecone for semantic matches
const memory = await vectordb.queryMemory({
  queryVector: embedding,
  limit: 3,  // Top-3 results
  metadata: { user: userId, chat: chatId }
});
// Output: [
//   { metadata: { content: "Auth discussion from 3 days ago" }, score: 0.92 },
//   { metadata: { content: "JWT implementation notes" }, score: 0.87 },
//   { metadata: { content: "Password hashing best practices" }, score: 0.81 }
// ]
```

### 3️⃣ **Short-Term Memory Assembly**
```javascript
// Fetch last 20 messages from same chat
const chatHistory = await messageModel.find({ chat: chatId }).limit(20);
// Output: [
//   { role: 'user', content: "How to secure endpoints?" },
//   { role: 'assistant', content: "Using JWT tokens..." },
//   { role: 'user', content: "What about refresh tokens?" }
// ]
```

### 4️⃣ **Prompt Construction**
```javascript
const prompt = `You are an intelligent assistant.

Long-term memory:
- Auth discussion from 3 days ago
- JWT implementation notes
- Password hashing best practices

Recent conversation:
User: How to secure endpoints?
Assistant: Using JWT tokens...
User: What about refresh tokens?

User question: What did we discuss about authentication?

Answer based on context above:`;
```

### 5️⃣ **Response Generation**
```javascript
// Send combined prompt to Gemini
const response = await aiservice.generateResponse(prompt);
// Model uses LTM + STM to generate accurate answer:
// "Based on our previous discussions, we talked about:
//  1. JWT tokens for endpoint security
//  2. Password hashing best practices
//  3. Refresh token strategies..."
```

---

## 🎯 Comparison: Basic ChatGPT vs This System

| Feature | Basic ChatGPT | This RAG System |
|---------|---------------|-----------------|
| **Context Source** | Fixed token window | LTM + recent STM |
| **Knowledge Retrieval** | None | Vector DB semantic search |
| **Multi-User Support** | Single user | Multi-user with scoped memory |
| **Persistence** | Conversation only | Messages + vectors |
| **Customization** | Prompt engineering only | Custom knowledge base via LTM |
| **Response Accuracy** | Based on training data | Enhanced by retrieved context |

---

## 🔒 Security Features

✅ **Password Security**: bcrypt hashing (rounds: 10)  
✅ **Token-Based Auth**: JWT with expiry  
✅ **HTTP-Only Cookies**: Prevents XSS attacks  
✅ **Protected Routes**: Auth middleware on all chat endpoints  
✅ **Socket Auth**: Validates token on WebSocket connections  
✅ **Data Isolation**: Messages scoped by user + chat ID  
✅ **Metadata Filtering**: Vector queries filtered by context  

---

## 📊 Performance Considerations

### Optimization Strategies
- **Lean Queries**: `.lean()` for message fetches (no Mongoose overhead)
- **Vector Caching**: Consider caching frequent embeddings
- **Pagination**: Limit 20 for chat history (tunable)
- **Async Operations**: All DB/API calls non-blocking
- **Connection Pooling**: MongoDB connection reuse

### Scalability Roadmap
- [ ] Message pagination with cursors
- [ ] Vector query result caching (Redis)
- [ ] Batch embedding generation
- [ ] Database indexing optimization
- [ ] Load balancing with sticky sessions for Socket.io

---

## 🧪 Testing Workflow

### Manual Testing Steps

```bash
# 1. Start server
npm run dev

# 2. Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'
# Copy token from response

# 4. Create chat session
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer <token>"

# 5. Connect via WebSocket client (e.g., Socket.io client)
# Emit 'user-message' event with message content
// Listen for 'ai-message' event with AI response
```

---

## 📚 Documentation Files

- **[README.md](README.md)** ← You are here (Overview & Getting Started)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** – Detailed system design and data flows
- **[FEATURES.md](FEATURES.md)** – In-depth feature breakdown
- **[API.md](API.md)** – Complete API endpoint documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

ISC

---

## 👤 Author

Built with ❤️ as part of Cohort 2.0 Backend Development

---

## 🔗 Useful Links

- [Socket.io Documentation](https://socket.io/docs/)
- [Pinecone Vector DB](https://www.pinecone.io/)
- [Google Gemini API](https://ai.google.dev/)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

**Happy coding! 🚀**
