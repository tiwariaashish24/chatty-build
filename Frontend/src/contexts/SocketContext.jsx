import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import SocketContext from './socket-context';
import { useAuth } from '@/hooks/use-auth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const SocketProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();
  const userId = user?._id;
  const socket = useMemo(
    () => (userId ? io(SOCKET_URL, { withCredentials: true, autoConnect: false }) : null),
    [userId],
  );

  useEffect(() => {
    if (!socket) return undefined;

    const handleConnect = () => socket.emit('userConnected', userId);
    const handleUserOnline = ({ userId: onlineUserId }) => {
      setOnlineUsers((currentUsers) =>
        currentUsers.includes(onlineUserId)
          ? currentUsers
          : [...currentUsers, onlineUserId],
      );
    };
    const handleUserOffline = ({ userId: offlineUserId }) => {
      setOnlineUsers((currentUsers) =>
        currentUsers.filter((currentUserId) => currentUserId !== offlineUserId),
      );
    };
    const handleDisconnect = () => setOnlineUsers([]);

    socket.on('connect', handleConnect);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('disconnect', handleDisconnect);
    socket.connect();

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [socket, userId]);

  const joinRoom = useCallback(
    (roomId) => socket?.emit('joinRoom', roomId),
    [socket],
  );
  const leaveRoom = useCallback(
    (roomId) => socket?.emit('leaveRoom', roomId),
    [socket],
  );
  const sendTyping = useCallback(
    (roomId, typingUserId) => socket?.emit('typing', { roomId, userId: typingUserId }),
    [socket],
  );
  const stopTyping = useCallback(
    (roomId, typingUserId) => socket?.emit('stopTyping', { roomId, userId: typingUserId }),
    [socket],
  );
  const value = useMemo(
    () => ({ socket, onlineUsers, joinRoom, leaveRoom, sendTyping, stopTyping }),
    [socket, onlineUsers, joinRoom, leaveRoom, sendTyping, stopTyping],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
