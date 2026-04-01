# API Documentation - Complete Reference

Full reference for all HTTP endpoints and WebSocket events in the Cohort ChatGPT system.

---

## 🔑 Authentication

All protected endpoints require a valid JWT token in one of these formats:

### Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Cookie (HTTP-Only)
```
Automatically sent by browser after login
```

### Error Response
```json
{
  "code": 401,
  "message": "Unauthorized - Invalid or missing token"
}
```

---

## 📋 HTTP Endpoints

### POST `/api/auth/register`

Create a new user account.

**Request:**
```json
{
  "username": "john_doe",
  "password": "securePassword123",
  "email": "john@example.com" // Optional
}
```

**Validation Rules:**
- `username`: 3-20 characters, alphanumeric + underscore
- `password`: Minimum 6 characters (bcrypt hashed server-side)
- `email`: Valid email format (optional)

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
// 400: Validation failed
{
  "code": 400,
  "message": "Username already exists"
}

// 400: Invalid input
{
  "code": 400,
  "message": "Password must be at least 6 characters"
}
```

**Headers Returned:**
```
Set-Cookie: authToken=<token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

---

### POST `/api/auth/login`

Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
```json
// 401: Invalid credentials
{
  "code": 401,
  "message": "Invalid username or password"
}

// 404: User not found
{
  "code": 404,
  "message": "User not found"
}
```

---

### GET `/api/chat`

Retrieve all chat sessions for logged-in user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?limit=10              // Default: 20, max: 100
?offset=0              // Pagination offset
?sort=-createdAt       // Sort field: -createdAt (newest first)
```

**Success Response (200):**
```json
{
  "chats": [
    {
      "_id": "607f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439011",
      "title": "Authentication Discussion",
      "description": "JWT and OAuth flows",
      "messageCount": 24,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z",
      "lastMessage": {
        "content": "Thanks for the explanation!",
        "createdAt": "2024-01-20T15:45:00Z"
      }
    },
    {
      "_id": "607f1f77bcf86cd799439012",
      "title": "Database Design",
      "description": "",
      "messageCount": 12,
      "createdAt": "2024-01-10T08:15:00Z",
      "updatedAt": "2024-01-18T12:00:00Z"
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

**Error Response (401):**
```json
{
  "code": 401,
  "message": "Unauthorized"
}
```

---

### POST `/api/chat`

Create a new chat session.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "API Design Discussion",
  "description": "RESTful APIs vs GraphQL" // Optional
}
```

**Validation Rules:**
- `title`: Required, 3-100 characters
- `description`: Optional, max 500 characters

**Success Response (201):**
```json
{
  "_id": "607f1f77bcf86cd799439013",
  "user": "507f1f77bcf86cd799439011",
  "title": "API Design Discussion",
  "description": "RESTful APIs vs GraphQL",
  "createdAt": "2024-01-21T14:20:00Z",
  "updatedAt": "2024-01-21T14:20:00Z"
}
```

**Error Response (400):**
```json
{
  "code": 400,
  "message": "Title is required"
}
```

---

### GET `/api/chat/:chatId`

Retrieve all messages from a specific chat.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
```
:chatId = MongoDB ObjectId of chat
```

**Query Parameters:**
```
?limit=50              // Default: 50, max: 100
?offset=0              // For pagination
```

**Success Response (200):**
```json
{
  "chat": {
    "_id": "607f1f77bcf86cd799439011",
    "title": "Authentication Discussion",
    "user": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "chat": "607f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439011",
      "role": "user",
      "content": "How does JWT authentication work?",
      "createdAt": "2024-01-15T10:35:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439002",
      "chat": "607f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439011",
      "role": "assistant",
      "content": "JWT is a token-based authentication mechanism...",
      "createdAt": "2024-01-15T10:37:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439003",
      "chat": "607f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439011",
      "role": "user",
      "content": "What about refresh tokens?",
      "createdAt": "2024-01-15T10:40:00Z"
    }
  ],
  "total": 24,
  "limit": 50,
  "offset": 0
}
```

**Error Response (404):**
```json
{
  "code": 404,
  "message": "Chat not found"
}
```

**Error Response (403):**
```json
{
  "code": 403,
  "message": "Forbidden - This chat belongs to another user"
}
```

---

### DELETE `/api/chat/:chatId`

Delete a chat session and all its messages.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Chat deleted successfully",
  "deletedCount": 1,
  "messagesDeleted": 24
}
```

**Error Response (403):**
```json
{
  "code": 403,
  "message": "Forbidden"
}
```

---

## 🔌 WebSocket Events

### Connection & Authentication

#### Client → Server: `connect`

**Auto-sent by Socket.io library**

The client initializes connection with auth token.

**Client Code:**
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: jwtToken
  }
});
```

#### Server → Client: `authenticated`

**Emitted after successful token verification**

```javascript
socket.on('authenticated', () => {
  console.log('Connected and authenticated');
});
```

**Payload:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "chatId": "607f1f77bcf86cd799439011"
}
```

#### Server → Client: `error`

**Emitted on authentication or other errors**

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

**Payload:**
```json
{
  "code": "AUTH_ERROR" | "INVALID_TOKEN" | "MESSAGE_ERROR",
  "message": "Human-readable error description"
}
```

---

### Messaging Events

#### Client → Server: `user-message`

**Send a message in the current chat**

```javascript
socket.emit('user-message', {
  content: "What is the RAG architecture?"
});
```

**Validation:**
- `content`: Required, 1-5000 characters
- Auto-saved to MongoDB
- Triggersembedding generation + vector storage
- Triggers RAG memory retrieval

**Server Processing:**
```
1. Save to MongoDB
2. Generate vector embedding
3. Query Pinecone for LTM
4. Fetch recent chat history
5. Build RAG prompt
6. Call Gemini API
7. Save response to MongoDB + Pinecone
8. Emit 'ai-message' event
```

---

#### Server → Client: `ai-message`

**Receive AI's response to user message**

```javascript
socket.on('ai-message', (data) => {
  console.log('AI Response:', data.message);
});
```

**Payload:**
```json
{
  "sender": "assistant",
  "message": "RAG (Retrieval-Augmented Generation) combines retrieval with generation. When you ask a question, the system first retrieves relevant documents from a vector database, then uses those as context for the language model...",
  "timestamp": "2024-01-21T14:25:00Z",
  "messageId": "507f1f77bcf86cd799439004"
}
```

**Timing:**
- Delayed by LTM query + vector generation + Gemini API call
- Expected latency: 1-3 seconds
- Will emit `error` event if any step fails

---

#### Server → Client: `chat-history`

**Load previous messages when joining chat**

```javascript
socket.on('chat-history', (data) => {
  data.messages.forEach(msg => {
    console.log(`${msg.role}: ${msg.content}`);
  });
});
```

**Payload:**
```json
{
  "chatId": "607f1f77bcf86cd799439011",
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "role": "user",
      "content": "Hello, what is RAG?",
      "createdAt": "2024-01-20T10:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439002",
      "role": "assistant",
      "content": "RAG stands for Retrieval-Augmented...",
      "createdAt": "2024-01-20T10:05:00Z"
    }
  ],
  "total": 2,
  "limit": 50
}
```

---

#### Server → Client: `disconnect`

**Connection closed (auto-handled)**

```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

**Reasons:**
- Client closed tab/browser
- Network error
- Server restarted
- Token expired

---

## 🧪 Example Workflows

### Workflow 1: Register & Create Chat

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "secure123"
  }'

# Response includes token: "eyJhbGciOi..."

# 2. Create chat
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learning RAG"
  }'

# Response includes chatId: "607f1f77bcf86cd799439011"
```

### Workflow 2: Send Message via WebSocket

```javascript
// Client
const socket = io('http://localhost:3000', {
  auth: { token: 'eyJhbGciOi...' }
});

socket.on('authenticated', () => {
  socket.emit('user-message', {
    content: "Explain how RAG works"
  });
});

socket.on('ai-message', (data) => {
  console.log('AI:', data.message);
  // Display in chat UI
});

socket.on('error', (error) => {
  console.error('Error:', error.message);
});
```

### Workflow 3: Retrieve Chat History

```bash
curl -X GET "http://localhost:3000/api/chat/607f1f77bcf86cd799439011?limit=50" \
  -H "Authorization: Bearer eyJhbGciOi..."
```

---

## 📊 Data Types

### User Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "<hashed by bcrypt>",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Chat Object
```json
{
  "_id": "607f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439011",
  "title": "Authentication Discussion",
  "description": "JWT and OAuth flows",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

### Message Object
```json
{
  "_id": "507f1f77bcf86cd799439001",
  "user": "507f1f77bcf86cd799439011",
  "chat": "607f1f77bcf86cd799439011",
  "role": "user" | "assistant",
  "content": "How does JWT work?",
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### Vector Record (Pinecone)
```json
{
  "id": "507f1f77bcf86cd799439001",
  "values": [0.145, -0.234, 0.089, ..., -0.456],
  "metadata": {
    "user": "507f1f77bcf86cd799439011",
    "chat": "607f1f77bcf86cd799439011",
    "content": "How does JWT work?"
  }
}
```

---

## 🔒 Security Headers

All responses include security headers:

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## ⚡ Rate Limiting

**Current Implementation:**
- No rate limit enforced (production version should add this)
- Recommended: 100 requests/minute per user
- Recommended: 30 messages/minute per user

**Future Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

const messageLimit = rateLimit({
  windowMs: 60000,     // 1 minute
  max: 30,             // 30 requests per minute
  message: 'Too many messages, please try again later'
});

app.post('/api/message', messageLimit, controller.sendMessage);
```

---

## 🧪 Testing Tips

### With cURL (HTTP)
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Create chat
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Chat"}'
```

### With Postman
1. Import collection from workspace (if available)
2. Set environment variables: `baseUrl`, `token`, `chatId`
3. Run requests in sequence (auth → create chat → get chat)

### With WebSocket Client
```javascript
// Node.js
const io = require('socket.io-client');
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('authenticated', () => console.log('Connected'));
socket.emit('user-message', { content: 'Hello!' });
socket.on('ai-message', (msg) => console.log('AI:', msg.message));
```

---

## 📈 Performance Metrics

### Expected Response Times

| Endpoint | Time |
|----------|------|
| POST /api/auth/register | 100-200ms |
| POST /api/auth/login | 100-200ms |
| GET /api/chat | 50-150ms |
| POST /api/chat | 50-100ms |
| GET /api/chat/:id | 100-200ms |
| **WebSocket user-message (RAG)** | **1-3 seconds** |

### Breakdown (WebSocket message)
- Save to MongoDB: 10-50ms
- Vector generation: 200-500ms
- LTM query: 50-150ms
- STM fetch: 20-100ms
- Response generation: 500-2000ms
- Broadcast: 10-50ms

---

**End of API Documentation**
