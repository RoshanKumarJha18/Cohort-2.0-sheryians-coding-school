# System Architecture - Detailed Technical Design

This document outlines the complete architectural design, data flows, and component interactions for the RAG-powered chatbot system.

---

## 📐 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│                  (Web Socket.io Client)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ WebSocket Events
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS SERVER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes                                               │   │
│  │  - POST /api/auth/register, /login                  │   │
│  │  - GET/POST /api/chat                               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Middlewares                                          │   │
│  │  - JWT verification                                 │   │
│  │  - Cookie parsing                                   │   │
│  │  - Socket auth validation                           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Controllers                                          │   │
│  │  - auth.controller: register/login logic            │   │
│  │  - chat.controller: CRUD chat & messages            │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────────────┐   │
│  ↓                      ↓                              ↓    │
│ [Auth]               [Chat]                        [Socket] │
│                                                              │
└──────────┬──────────────────┬──────────────────────┬────────┘
           │                  │                      │
           ↓                  ↓                      ↓
    [MongoDB]         [MongoDB]              [Pinecone + Gemini]
    (Users)           (Chats, Messages)      [message.socket.js]
           │                  │                      │
           └──────────────────┴──────────────────────┘
```

---

## 🔄 Message Flow: User Query → AI Response

### Step 1: Authentication & Connection

```
Client connects via Socket.io
    ↓
[socket.on('connect')]
    ↓
Validator checks JWT token (auth.middlewares.js)
    ↓
Emit 'authenticated' event back to client
OR close connection if invalid
```

**Code Reference:**
```javascript
// src/sockets/message.socket.js
io.on('connection', (socket) => {
  const token = socket.handshake.auth.token;
  const payload = verifyJWT(token);
  // Validated
});
```

---

### Step 2: User Sends Message

```
Client emits: socket.emit('user-message', { content: "..." })
    ↓
Server receives: socket.on('user-message', async (data) => {
    ↓
[Save Message to MongoDB]
  POST → messageModel.create({
    user: userId,
    chat: chatId,
    role: 'user',
    content: userMessage
  })
    ↓
Response: Message document with _id, timestamps
```

**Code Reference:**
```javascript
// src/sockets/message.socket.js
socket.on('user-message', async (messagePayload) => {
  const userMessage = await messageModel.create({
    user: socket.userId,
    chat: socket.chatId,
    role: 'user',
    content: messagePayload.content,
    createdAt: new Date()
  });
});
```

---

### Step 3: Generate Vector Embedding

```
[User Message Content]
    ↓
Call: aiservice.generateVector(messageContent)
    ↓
Sends to Google Gemini API:
  {
    model: 'embedding-001',
    content: userMessage
  }
    ↓
Returns: Float64Array (384 dimensions)
  Example: [0.12, -0.45, 0.89, ..., -0.34]
    ↓
[Vector ready for Pinecone]
```

**Code Reference:**
```javascript
// src/services/ai.service.js
async generateVector(content) {
  const result = await client.embedContent({
    model: 'models/embedding-001',
    content: { parts: [{ text: content }] }
  });
  return result.embedding.values; // Float64Array
}
```

---

### Step 4: Retrieve Long-Term Memory (LTM) from Vector DB

```
[Vector Embedding]
    ↓
Call: vectordb.queryMemory({
  queryVector: embedding,
  limit: 3,
  metadata: { user: userId, chat: chatId }
})
    ↓
Pinecone performs vector similarity search
    ↓
Filters results by metadata (same user + chat)
    ↓
Returns top-3 most similar messages (with scores)
  Example:
  [
    {
      id: "msg_123",
      score: 0.92,
      metadata: {
        user: "userId",
        chat: "chatId",
        content: "Previous auth discussion"
      }
    },
    {
      id: "msg_456",
      score: 0.87,
      metadata: { content: "JWT token explanation" }
    },
    ...
  ]
    ↓
Extract content: ["Previous auth discussion", "JWT token...", ...]
    ↓
[LTM Retrieved]
```

**Code Reference:**
```javascript
// src/services/vectordb.service.js
async queryMemory({ queryVector, limit = 3, metadata }) {
  const results = await index.query({
    vector: queryVector,
    topK: limit,
    filter: {
      user: metadata.user,
      chat: metadata.chat
    },
    includeMetadata: true
  });
  return results.matches; // Top-3 with scores
}
```

---

### Step 5: Retrieve Short-Term Memory (STM) from MongoDB

```
[Current Chat ID]
    ↓
Query: messageModel
  .find({ chat: chatId })
  .sort({ createdAt: 1 })
  .limit(20)
  .lean()
    ↓
MongoDB returns last 20 messages:
  [
    { role: 'user', content: 'First question' },
    { role: 'assistant', content: 'First answer' },
    { role: 'user', content: 'Follow-up' },
    ...
  ]
    ↓
Format as text:
  "User: First question\n
   Assistant: First answer\n
   User: Follow-up\n..."
    ↓
[STM Retrieved]
```

**Code Reference:**
```javascript
// src/sockets/message.socket.js
const chatHistory = await messageModel
  .find({ chat: socket.chatId })
  .sort({ createdAt: 1 })
  .limit(20)
  .lean();

const chatText = chatHistory
  .map(msg => `${msg.role}: ${msg.content}`)
  .join('\n');
```

---

### Step 6: Construct RAG Prompt

```
[System Instructions] + [LTM] + [STM] + [User Query]
    ↓
Prompt template:
  "You are an intelligent assistant.
  
  Long-term memory:
  - Previous auth discussion
  - JWT token explanation
  - Password hashing notes
  
  Recent conversation:
  User: First question
  Assistant: First answer
  User: Follow-up
  
  User question: What is JWT?
  
  Based on the context above, provide an accurate answer."
    ↓
[Prompt ready for LLM]
```

**Code Reference:**
```javascript
// src/sockets/message.socket.js
const prompt = `You are an intelligent assistant.

${memoryText ? `Long-term memory:\n${memoryText}\n` : ''}

Recent conversation:
${chatText}

User question: ${messagePayload.content}

Answer in detail based on the context above:`;
```

---

### Step 7: Generate AI Response

```
[Prompt Text]
    ↓
Call: aiservice.generateResponse(prompt)
    ↓
Sends to Google Gemini:
  {
    model: 'gemini-1.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  }
    ↓
Gemini processes prompt with:
  - LTM context (retrieved docs)
  - STM context (recent chat)
  - System instructions
    ↓
Returns: "JWT is a token-based authentication..."
    ↓
[Response generated]
```

**Code Reference:**
```javascript
// src/services/ai.service.js
async generateResponse(promptText) {
  const response = await client.generateContent({
    contents: [{ type: 'text', text: promptText }]
  });
  return response.text(); // AI response
}
```

---

### Step 8: Save AI Response to Storage

```
[AI Response Text]
    ↓
Save to MongoDB:
  messageModel.create({
    user: userId,
    chat: chatId,
    role: 'assistant',
    content: aiResponse,
    createdAt: new Date()
  })
    ↓
MongoDB returns saved document with _id
    ↓
Calculate embedding vector for response
  aiservice.generateVector(aiResponse)
    ↓
Upsert to Pinecone:
  vectordb.upsertMessage({
    id: messageDocument._id,
    vector: responseEmbedding,
    metadata: {
      user: userId,
      chat: chatId,
      content: aiResponse
    }
  })
    ↓
Pinecone stores vector for future retrieval
    ↓
[Response persisted to both databases]
```

**Code Reference:**
```javascript
// src/sockets/message.socket.js
const aiMessage = await messageModel.create({
  user: socket.userId,
  chat: socket.chatId,
  role: 'assistant',
  content: response
});

const responseVector = await aiservice.generateVector(response);
await vectordb.upsertMessage({
  id: aiMessage._id.toString(),
  vector: responseVector,
  metadata: {
    user: socket.userId.toString(),
    chat: socket.chatId.toString(),
    content: response
  }
});
```

---

### Step 9: Broadcast Response to Client

```
[AI Response Ready]
    ↓
Server emits:
  socket.emit('ai-message', {
    sender: 'assistant',
    message: aiResponse,
    timestamp: new Date()
  })
    ↓
Client receives via Socket.io
    ↓
Frontend displays response in chat UI
    ↓
[Conversation loop complete]
```

**Code Reference:**
```javascript
// src/sockets/message.socket.js
socket.emit('ai-message', {
  sender: 'assistant',
  message: response,
  timestamp: new Date()
});
```

---

## 🗂️ Data Models

### User Schema

```javascript
// src/models/user.model.js
{
  _id: ObjectId,
  username: String (unique, indexed),
  password: String (bcrypt hashed),
  email: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `{ username: 1 }`  
**Purpose:** Authentication + user identification

---

### Chat Session Schema

```javascript
// src/models/chat.model.js
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  title: String,
  description: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `{ user: 1, createdAt: -1 }`  
**Purpose:** Organize messages by conversation scope

---

### Message Schema

```javascript
// src/models/message.model.js
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  chat: ObjectId (ref: Chat),
  role: String (enum: ['user', 'assistant']),
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `{ chat: 1, createdAt: 1 }`  
**Purpose:** Store conversation history + enable STM retrieval

---

### Pinecone Vector Record

```javascript
// Vector DB (Pinecone)
{
  id: String (message._id),
  values: Float64Array (384 dimensions),
  metadata: {
    user: String (userId),
    chat: String (chatId),
    content: String (message text)
  }
}
```

**Metadata Filters:** `{ user: "...", chat: "..." }`  
**Purpose:** Fast semantic search by user/chat scope

---

## 🔐 Authentication Flow

### User Registration

```
HTTP POST /api/auth/register
  {
    username: "john_doe",
    password: "securePassword123"
  }
    ↓
auth.controller.register()
    ↓
Validate input (username length, password strength)
    ↓
Check if username exists → reject if yes
    ↓
Hash password: bcrypt.hash(password, 10)
    ↓
Create user: userModel.create({
  username,
  password: hashedPassword
})
    ↓
Return token using JWT:
  jwt.sign(
    { _id: user._id },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
    ↓
Set HTTP-only cookie with token
    ↓
Response: {
  token,
  user: { _id, username }
}
```

### User Login

```
HTTP POST /api/auth/login
  {
    username: "john_doe",
    password: "securePassword123"
  }
    ↓
auth.controller.login()
    ↓
Find user by username
    ↓
Compare password: bcrypt.compare(provided, stored)
    ↓
If mismatch → return 401 Unauthorized
    ↓
Generate JWT token on successful match
    ↓
Set HTTP-only cookie
    ↓
Response: {
  token,
  user: { _id, username }
}
```

### Socket Authentication

```
Client connects with:
  socket = io('http://localhost:3000', {
    auth: {
      token: jwtToken
    }
  })
    ↓
Server receives in socket.handshake.auth.token
    ↓
auth.middlewares.verifyJWT(token)
    ↓
Extract payload: { _id: userId }
    ↓
Store userId on socket:
  socket.userId = userId
  socket.chatId = chatId
    ↓
Grant access to message handlers
```

---

## 🧠 RAG Components Architecture

### AI Service (`src/services/ai.service.js`)

```javascript
class AIService {
  
  // Generate vector embedding for text
  async generateVector(content) {
    // Input: "What is authentication?"
    // Output: [0.12, -0.45, 0.89, ..., -0.34] (384-dim)
    // Used for: Pinecone queries + vector DB storage
  }
  
  // Generate LLM response from prompt
  async generateResponse(promptText) {
    // Input: Full RAG prompt with LTM + STM
    // Output: Natural language response
    // Uses: Google Gemini API
  }
}
```

**Key Methods:**
- `generateVector(content)` — Embedding generation
- `generateResponse(prompt)` — Response generation

---

### Vector DB Service (`src/services/vectordb.service.js`)

```javascript
class VectorDBService {
  
  // Query similar messages by vector similarity
  async queryMemory({ queryVector, limit, metadata }) {
    // Input: embedding vector + filter metadata
    // Output: top-K most similar messages with scores
    // Used for: LTM retrieval
  }
  
  // Store message vector in DB
  async upsertMessage({ id, vector, metadata }) {
    // Input: message ID, embedding, context metadata
    // Used for: Indexing new messages for future retrieval
  }
}
```

**Key Methods:**
- `queryMemory(...)` — Semantic search
- `upsertMessage(...)` — Vector indexing

---

### Message Socket Handler (`src/sockets/message.socket.js`)

```javascript
class MessageSocket {
  
  // Orchestrates entire RAG pipeline
  async handleUserMessage(messagePayload) {
    // 1. Save user message
    // 2. Generate vector embedding
    // 3. Query memory (LTM)
    // 4. Fetch chat history (STM)
    // 5. Build RAG prompt
    // 6. Call AI service
    // 7. Save + store response
    // 8. Broadcast to client
  }
}
```

---

## 📊 Scalability Architecture

### Current Bottlenecks

1. **Vector Generation**: Each user message → API call to Gemini
   - Solution: Batch embeddings, cache common phrases

2. **Pinecone Queries**: Sequential vector search per message
   - Solution: Vector result caching (Redis)

3. **Chat History Fetch**: `.limit(20)` might miss context
   - Solution: Pagination with cursors

4. **Socket Broadcast**: Direct emit per client
   - Solution: Redis pub/sub for multi-server deployments

### Recommended Improvements

```
┌──────────────────────────────────────┐
│   Load Balancer (Sticky Sessions)    │
└──────────────────────────────────────┘
           │        │        │
      ┌────▼─┐  ┌─────┐  ┌──────┐
      │Node 1│  │Node 2│  │Node 3│ (API Servers)
      └────┬─┘  └─────┘  └──────┘
           │
    ┌──────┴──────────┐
    ▼                 ▼
 MongoDB         Pinecone
 (Messages)      (Vectors)
    │
    ▼
 Redis Cache (Vector results, embeddings)
```

---

## 🔒 Security Architecture

### Request Flow with Auth

```
HTTP Request / WebSocket Connect
    ↓
[Cookie Parser Middleware]
    ↓
Extract JWT from:
  - Authorization header
  - HTTP-only cookie
  - Socket auth object
    ↓
[verifyJWT(token)]
  - Validate signature with secret
  - Check expiration
  - Extract userId
    ↓
Valid → Continue with request
Invalid → 401 Unauthorized / close socket
    ↓
Store userId on request/socket for authorization
```

### Data Isolation

```
User A                      User B
  ↓                           ↓
userId: "1a2b3c"         userId: "9x8y7z"
  ↓                           ↓
Chats:                    Chats:
  - chat_101                - chat_202
  ↓                           ↓
Messages:                 Messages:
  - Only from chat_101      - Only from chat_202
  ↓                           ↓
Vector Queries:           Vector Queries:
  filter: {                 filter: {
    user: "1a2b3c"           user: "9x8y7z"
  }                         }
```

---

## 🧪 Error Handling Strategy

```
Try {
  // Execute RAG pipeline
} Catch (error) {
  
  if (error.type === 'VECTOR_GENERATION_FAILED') {
    // Fallback: Use STM only, skip LTM
    generateResponse(chatText + userQuery)
  }
  
  else if (error.type === 'MEMORY_QUERY_FAILED') {
    // Skip LTM, continue with STM
    memoryText = ""
  }
  
  else if (error.type === 'RESPONSE_GENERATION_FAILED') {
    // Return helpful error to user
    socket.emit('error', {
      message: 'AI service temporarily unavailable'
    })
  }
  
  else {
    // Generic error handling
    console.error(error)
    socket.emit('error', { message: 'Something went wrong' })
  }
}
```

---

## 📈 Performance Metrics

### Expected Response Times (typical)

| Operation | Time |
|-----------|------|
| MongoDB message save | 10-50ms |
| Vector generation (Gemini) | 200-500ms |
| Pinecone query (top-3) | 50-150ms |
| Chat history fetch | 20-100ms |
| AI response generation (Gemini) | 500-2000ms |
| **Total end-to-end** | **~1-3 seconds** |

### Optimization Tips

- **Cache frequent embeddings** in memory
- **Use `.lean()`** for MongoDB queries (saves 15-20%)
- **Batch vector operations** when possible
- **Implement result caching** in Redis
- **Monitor API latencies** and adjust limits

---

## 🔗 Integration Points

### Google Gemini API

```
Endpoints:
  - embedContent: Vector generation
  - generateContent: Response generation

Rate Limits:
  - 60 requests/min (free tier)
  - Handle 429 with retry-after

Authentication:
  - API key in header
  - Store in .env (GOOGLE_GEMINI_KEY)
```

### Pinecone Vector DB

```
Operations:
  - query(): Semantic search
  - upsert(): Store vectors
  - delete(): Remove vectors

Indexes:
  - chat-embeddings (384-dimensional)
  - Cost: ~$0.04 per million vectors/month

Metadata:
  - Supports filtering on user + chat fields
```

### MongoDB

```
Operations:
  - CRUD on users, chats, messages
  - Aggregation for analytics

Indexes:
  - { chat: 1, createdAt: 1 }
  - { user: 1 }
  - { username: 1 }

Replication:
  - Atlas provides auto-replication + failover
```

---

## 📋 Deployment Architecture

### Development

```
Local Machine
  ├── Node.js server (localhost:3000)
  ├── MongoDB (local or Atlas)
  ├── Pinecone API calls
  └── Google Gemini API calls
```

### Production

```
┌─────────────────────────────────────┐
│        Heroku / Railway             │
│  (Dyno / Instance with Node.js)     │
│           ↓                         │
│      Express Server                 │
│      Socket.io Handler              │
│      Services + Controllers         │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┼─────────┐
        ↓         ↓         ↓
   MongoDB    Pinecone  Gemini API
   (Atlas)    (Cloud)   (Google Cloud)
```

---

**End of Architecture Documentation**
