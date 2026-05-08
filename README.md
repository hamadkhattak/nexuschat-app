# NexusChat —A Real-Time Chating App

A  real-time chating platform built with Node.js,Express ,Socket.IO, and MongoDB.

## Architecture

```
chat-saas/
├── backend/
│   ├── models/          # MongoDB schemas (Business, Message)
│   ├── services/        # Business logic (authService, chatService)
│   ├── controllers/     # HTTP request/response handlers
│   ├── routes/          # Express route definitions
│   ├── middleware/       # JWT auth middleware
│   ├── socket.js        # Socket.IO initialization & event handlers
│   └── server.js        # Entry point
└── frontend/
    └── index.html       # Vanilla HTML/CSS/JS client
```

## How It Works

1. **Business Registration** → POST `/api/auth/register` → returns JWT token
2. **Login** → POST `/api/auth/login` → returns JWT token
3. **Frontend** → user pastes JWT, clicks "Join Chat Room"
4. **Socket.IO** authenticates the token, assigns socket to `business:<id>` room
5. **Messages** are broadcast only within the same business room
6. **Persistence** → all messages saved to MongoDB, history sent on join

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or use MongoDB Atlas)

### Install & Run

```bash
cd backend

# Copy environment config
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET

npm install
npm start
```

Open http://localhost:3000

### Environment Variables

| Variable       | Default                              | Description               |
|----------------|--------------------------------------|---------------------------|
| PORT           | 3000                                 | Server port               |
| MONGODB_URI    |                                      | MongoDB connection string |
| JWT_SECRET     | (required)                           | Secret for signing JWTs   |
| JWT_EXPIRES_IN | 7d                                   | Token expiry              |

## API Endpoints

### Auth
| Method | Path              | Body                           | Auth | Description       |
|--------|-------------------|--------------------------------|------|-------------------|
| POST   | /api/auth/register | `{name, email, password}`     | No   | Register business |
| POST   | /api/auth/login    | `{email, password}`           | No   | Login             |
| GET    | /api/auth/me       | —                             | JWT  | Get current biz   |

### Chat
| Method | Path              | Auth | Description              |
|--------|-------------------|------|--------------------------|
| GET    | /api/chat/messages | JWT | Fetch last 50 messages   |

### Socket.IO Events

**Client → Server**
- `message` → `{ sender: string, text: string }`

**Server → Client**
- `history` → array of recent messages
- `message` → `{ _id, sender, text, createdAt }`
- `user_joined` → `{ businessName, timestamp }`
- `user_left` → `{ businessName, timestamp }`
- `error` → `{ message: string }`

## Multi-Business Isolation

Each business gets its own Socket.IO room (`business:<mongoId>`). Messages are broadcast exclusively within that room — businesses never see each other's conversations.
