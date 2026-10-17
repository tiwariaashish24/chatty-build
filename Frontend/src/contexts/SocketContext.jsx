import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket');
        newSocket.emit('userConnected', user._id);
      });

      newSocket.on('userOnline', ({ userId }) => {
        setOnlineUsers((prev) => [...prev, userId]);
      });

      newSocket.on('userOffline', ({ userId }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      newSocket.on('receiveMessage', (message) => {
        // Handle in chat component
      });

      newSocket.on('receiveRoomMessage', (message) => {
        // Handle in room component
      });

      newSocket.on('messageDeleted', ({ messageId }) => {
        // Handle in chat component
      });

      newSocket.on('messageEdited', (message) => {
        // Handle in chat component
      });

      newSocket.on('messageReaction', ({ messageId, reactions }) => {
        // Handle in chat component
      });

      newSocket.on('messageRead', ({ messageId }) => {
        // Handle in chat component
      });

      newSocket.on('userTyping', ({ userId }) => {
        // Handle in chat component
      });

      newSocket.on('userStoppedTyping', ({ userId }) => {
        // Handle in chat component
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('joinRoom', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leaveRoom', roomId);
    }
  };

  const sendTyping = (roomId, userId) => {
    if (socket) {
      socket.emit('typing', { roomId, userId });
    }
  };

  const stopTyping = (roomId, userId) => {
    if (socket) {
      socket.emit('stopTyping', { roomId, userId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        joinRoom,
        leaveRoom,
        sendTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
