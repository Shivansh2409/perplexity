# Perplexity Backend - AI Chat API

## 🚀 Quick Start

```bash
cd backend
npm install
npm run dev  # nodemon server.js (port 8080)
```

## 🏗️ Architecture

```
server.js → app.js → Routes → Controllers → Services → Models
     ↓
Socket.IO (real-time chat)
MongoDB + Mongoose
Google Gemini + Mistral AI
```

## 📊 Database Schemas

### User

```js
{
  (username, email, password(hashed));
}
```

### Chat

```js
{
  title,
  createdBy,
  participants[],
  permissions: Map<userId, 'no-access'|'view-only'|'edit'>,
  embedding[]
}
```

### Message (Rich!)

```js
{
  content, owner, chatroom, sender('user'/'bot'),
  reactions: Map<emoji, [userIds]>,
  isPinned, pinnedBy, pinnedAt,
  savedBy[], replyTo, isEdited, editedAt
}
```

### AccessRequest

```js
{
  (requester, targetUser, chat, status("pending" / "approved" / "rejected"));
}
```

## 🌐 API Routes (23 total)

### Auth `/api/auth` ✨

| Method | Path        | Auth | Desc             |
| ------ | ----------- | ---- | ---------------- |
| POST   | `/register` | -    | Create account   |
| POST   | `/login`    | -    | JWT cookie login |
| GET    | `/get-user` | ✓    | Profile          |

### Chat `/api/chat` 🚀 (Core - 12 endpoints)

| Method        | Path                                | Feature             |
| ------------- | ----------------------------------- | ------------------- |
| POST          | `/create-chat`                      | New AI chat         |
| POST          | `/flow-up-chat/:chatId`             | Send msg → AI reply |
| GET           | `/get-chat/:chatId`                 | Chat + messages     |
| **Reactions** | POST/DELETE `/message/:id/reaction` | Emoji reacts        |
| **Pin**       | PUT `/message/:id/pin`              | Owner pins          |
| **Save**      | PUT `/message/:id/save`             | Personal saves      |
| PUT           | `/message/:id/edit`                 | Edit own msg        |
| GET           | `/saved-messages`                   | My saved msgs       |

### Access `/api/access` 🔐

| Method | Path                          | Desc                |
| ------ | ----------------------------- | ------------------- |
| POST   | `/request`                    | Request chat access |
| GET    | `/requests/pending`           | Owner pending reqs  |
| PUT    | `/requests/:id`               | Approve/Reject      |
| PUT    | `/permission/:chatId/:userId` | Set perms           |
| GET    | `/permission/:chatId`         | My permission       |

## 🔌 Socket.IO Events

**Connection Flow:**

```
Client connect → socketAuthMiddleware → join(userId room)
                    ↓
emit('join_room', chatId) → permission check → join(chat room)
                    ↓
emit('send_message') → AI response → emit('message') to room
```

**Real-time Events:**

- **Client → Server**: `join_room`, `send_message`
- **Server → Client**: `message`, `access_request_received`, `access_granted`, `permission_updated`

## 🎯 Core Business Flows

### 1. Chat Creation

```
POST /api/chat/create-chat → Mistral(title) → Save Chat → return chatId
```

### 2. AI Conversation (Dual: HTTP + Socket)

```
User msg → Save → Gemini(AI reply) → Save → Update embeddings → Emit real-time
```

### 3. Access Control (Advanced!)

```
UserA requests → Owner notified (socket) → Approve → Add participant + 'view-only' → Socket notify
Owner upgrades: 'view-only' → 'edit' → Real-time permission update
```

## 🧠 AI Integration

- **Responses**: Google Gemini (`gemini-2.5-flash-lite`)
- **Titles**: Mistral (`mistral-medium-latest`)
- **Embeddings**: Google (`gemini-embedding-2-preview`)

## ✅ Health Check

**All components functional:**

- ✅ Routes: 23 endpoints (auth, chat, access)
- ✅ Socket: Auth, rooms, real-time AI
- ✅ DB: 4 models w/ advanced features
- ✅ Permissions: Granular Map-based
- ✅ No syntax errors detected

**Minor issues:**

- `server.soket.js` → rename to `server.socket.js`
- Add rate limiting
- Input validation incomplete

## 🛠️ Environment

```
MONGO_URI, JWT_SECRET, GOOGLE_API_KEY, MISTRAL_API_KEY
```

Built with ❤️ for AI-powered collaborative chats!
