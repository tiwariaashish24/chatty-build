# Chatty Build 💬

A real-time chat application built with **React, Vite, Node.js, Express, MongoDB, and Socket.IO**. Chatty Build supports direct conversations and chat rooms, with authentication and live user-presence updates.

## ✨ Features

- **User authentication** with signup, login, and logout flows
- **Direct messaging** between users
- **Chat rooms** with room creation and membership management
- **Real-time communication** using Socket.IO
- **Online/offline presence** and last-seen updates
- **Typing indicators** for conversations and rooms
- **Message actions** supported by the API, including editing, deleting, reactions, and read receipts
- **Image-message support** through Cloudinary
- **Responsive React interface** with reusable UI components

> Features depend on the configured backend, database, and third-party credentials. Verify each workflow in your environment before deploying.

## 🧰 Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- shadcn-style UI components
- Axios
- Socket.IO Client
- Lucide React

### Backend
- Node.js
- Express
- MongoDB and Mongoose
- Socket.IO
- JSON Web Tokens (JWT)
- bcryptjs
- Cookie Parser
- Cloudinary
- dotenv



## ✅ Prerequisites

Install the following before you start:

- [Node.js](https://nodejs.org/) (use a version compatible with the installed Vite and backend dependencies)
- npm
- A MongoDB database, either local or [MongoDB Atlas](https://www.mongodb.com/atlas)
- A [Cloudinary](https://cloudinary.com/) account if you want image uploads

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tiwariaashish24/chatty-build.git
cd chatty-build
```

### 2. Configure the backend

```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend` directory. You can start from the example file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

Fill in the environment variables:

| Variable | Description |
|---|---|
| `MONGODB_URL` | MongoDB connection string |
| `PORT` | Backend port (example: `8080`) |
| `FRONTEND_URL` | Frontend origin (usually `http://localhost:5173`) |
| `JWT_SECRET` | A long, private secret used to sign JWTs |
| `NODE_ENV` | Runtime environment, such as `development` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Keep your real `.env` file and API secrets out of version control.

Start the backend:

```bash
npm run dev
```

The backend starts on the port configured in `PORT`.

### 3. Configure the frontend

Open a **second terminal** from the repository root:

```bash
cd Frontend
npm install
```

The frontend's API client must point to your running backend. Check `src/lib/axios.js` and configure its base URL to match your local backend if needed.

Start the frontend:

```bash
npm run dev
```

Vite prints the local URL in the terminal; the default is commonly `http://localhost:5173`.

## 🔌 Backend API Overview

The backend mounts these API route groups:

| Route prefix | Purpose |
|---|---|
| `/api/auth` | Signup, login, logout, and authentication |
| `/api/message` | Direct messages, room messages, and message actions |
| `/api/room` | Room creation and room/member management |
| `/api/user` | User-related endpoints |

Protected endpoints require a valid authenticated session or token as implemented by the backend middleware.

## ⚡ Real-Time Events

The Socket.IO server handles events for connection status, room membership, and live chat updates. Implemented event names include:

- `userConnected`
- `userOnline` / `userOffline`
- `joinRoom` / `leaveRoom`
- `typing` / `stopTyping`
- `receiveMessage` / `receiveRoomMessage`
- `messageEdited` / `messageDeleted`
- `messageReaction` / `messageRead`

## 🛠️ Useful Commands

Run commands from the relevant directory.

**Backend — `Backend/`**
```bash
npm install
npm run dev
```

**Frontend — `Frontend/`**
```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## 🔐 Security Notes

- Never commit `.env` files or expose JWT, MongoDB, or Cloudinary credentials.
- Use a strong, unique `JWT_SECRET`.
- Configure CORS with the exact frontend origin used in production.
- Use HTTPS in production and validate/sanitize incoming data.
- Review authentication, room-membership checks, rate limits, and authorization before exposing the app publicly.

## 🧭 Roadmap

Possible next improvements include message search, file sharing, notifications, stronger input validation, automated tests, and production deployment documentation.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push your branch and open a pull request.

---

Built with ❤️ using React and Node.js.
