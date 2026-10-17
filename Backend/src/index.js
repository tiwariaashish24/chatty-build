    import express from "express";
    import authRoutes from "./routes/auth.route.js";
    import messageRoutes from "./routes/message.route.js";
    import roomRoutes from "./routes/room.route.js";
    import userRoutes from "./routes/user.route.js";
    import dotenv from "dotenv";
    import { connectDB } from "./lib/db.js";
    import cookieParser from 'cookie-parser';
    import { createServer } from 'http';
    import { Server } from 'socket.io';
    import User from "./models/user.model.js";


    dotenv.config();

    const app = express();
    const PORT = process.env.PORT;

    const server = createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    app.use(express.json());
    app.use(cookieParser());

    app.use("/api/auth", authRoutes);
    app.use("/api/message", messageRoutes);
    app.use("/api/room", roomRoutes);
    app.use("/api/user", userRoutes);

    
    app.set('io', io);

    
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

      
        socket.on('userConnected', async (userId) => {
            socket.userId = userId;
            socket.join(userId);

           
            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                status: 'online',
                lastSeen: new Date()
            });

            io.emit('userOnline', { userId });
            console.log(`User ${userId} is now online`);
        });

       
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.userId} joined room ${roomId}`);
        });

       
        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.userId} left room ${roomId}`);
        });

        
        socket.on('typing', ({ roomId, userId }) => {
            if (roomId) {
                socket.to(roomId).emit('userTyping', { userId });
            } else {
              
                socket.broadcast.emit('userTyping', { userId });
            }
        });

       
        socket.on('stopTyping', ({ roomId, userId }) => {
            if (roomId) {
                socket.to(roomId).emit('userStoppedTyping', { userId });
            } else {
                socket.broadcast.emit('userStoppedTyping', { userId });
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            if (socket.userId) {
               
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    status: 'offline',
                    lastSeen: new Date()
                });

                
                io.emit('userOffline', { userId: socket.userId });
                console.log(`User ${socket.userId} is now offline`);
            }
            console.log('User disconnected:', socket.id);
        });
    });

    const startServer = async () => {
        try {
            await connectDB();
            server.listen(PORT || 8080, () => {
                console.log("server is running on PORT:" + (PORT || 8080));
            });
        } catch {
            console.error(
                "Server startup aborted. Check MONGODB_URL and allow this machine's IP in MongoDB Atlas Network Access.",
            );
            process.exitCode = 1;
        }
    };

    startServer();