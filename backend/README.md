# Perplexity Clone - Backend API

This is the backend service for the Perplexity Clone application. It handles user authentication, real-time socket communications, AI interactions (via Gemini and Mistral), chat history management, and complex permission handling.

## Tech Stack

- **Node.js & Express**: API Routing and HTTP server.
- **MongoDB & Mongoose**: Database and object modeling.
- **Socket.io**: Real-time bidirectional event-based communication.
- **LangChain**: AI orchestration.
- **Google Gemini 2.5 Flash / Embeddings**: Main conversational AI and vector embeddings.
- **Mistral AI**: Used specifically for concise chat title generation.
- **JWT (JSON Web Tokens)**: Authentication and authorization.

---

## Core Architecture & Data Flow

### 1. Chat & AI Flow

Whenever a user sends a message, the backend processes it in the following order:

1. Saves the User's message to the `Message` collection.
2. Fetches the entire chat history for context.
3. Passes the history to **Gemini AI** via Langchain to generate a response.
4. Saves the AI's response to the database.
5. Generates **Vector Embeddings** for the entire chat history and updates the `Chat` document.
6. Returns the message via HTTP (`/flow-up-chat`) or broadcasts it via Socket.io (`message` event).

### 2. Real-Time Sockets

Sockets are heavily utilized to avoid polling and provide a seamless real-time experience:

- **Chatting**: Users emit `send_message`, and the backend broadcasts `message` once the AI replies.
- **Permissions**: Users can request access to private chats. The server pushes `access_request_received` to the owner instantly. When the owner approves, `access_granted` is emitted back.
- **Typing Indicators**: Listens for `user_typing` and broadcasts to the respective chat room.

### 3. Permissions & Access Control

Chats have participants and specific map-based permissions (`no-access`, `view-only`, `edit`).
If User A wants to view User B's chat:

1. User A triggers the `requestAccess` controller.
2. A pending `AccessRequest` document is created.
3. User B approves the request (`updateRequestStatus`).
4. User A is added to the `participants` array with `view-only` permissions by default.

---

## Folder Structure

```text
src/
 ├── controllers/       # Route logic (chat, user, access)
 ├── middleware/        # JWT Authentication interceptors
 ├── models/            # Mongoose Schemas (User, Chat, Message, AccessRequest)
 ├── routes/            # Express Routes definitions
 ├── service/           # External API handling (AI config, Socket events)
 ├── sockets/           # Socket.io server initialization and connection handlers
 └── validators/        # Request payload validation
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8080
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_API_KEY=your_gemini_api_key
MISTRAL_API_KEY=your_mistral_api_key
```

---

## Unique Features

This backend incorporates advanced messaging features typical of modern platforms like Slack or Discord:

- **Message Reactions**: Map-based storage linking emojis to Arrays of ObjectIds.
- **Pinned Messages**: Chat owners can pin specific messages to the top of the chat context.
- **Saved Messages**: Users can bookmark messages globally for their personal view.
- **Message Editing**: Owners can edit their messages, which flags them with `isEdited`.

---

## Getting Started

1. `npm install`
2. Ensure your MongoDB instance is running.
3. Set up your `.env` keys.
4. `npm run dev` (Starts the server on your specified port).
