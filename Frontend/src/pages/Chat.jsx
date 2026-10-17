import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { messageService } from '@/services/message.service';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Search,
  Plus,
  LogOut,
  Users,
  MessageSquare,
} from 'lucide-react';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUsers = async () => {
    try {
      const data = await messageService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const data = await messageService.getMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const message = await messageService.sendMessage(selectedUser._id, {
        text: newMessage,
      });
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profilePic} size="lg" online={isOnline(user?._id)} />
            <div>
              <h2 className="font-semibold text-gray-900">{user?.fullName}</h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/rooms')}>
              <Users className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading users...</div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedUser?._id === u._id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.profilePic} online={isOnline(u._id)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{u.fullName}</h3>
                      {isOnline(u._id) && <Badge variant="success">Online</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{u.email}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                <Avatar src={selectedUser.profilePic} online={isOnline(selectedUser._id)} />
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedUser.fullName}</h2>
                  <p className="text-sm text-gray-500">
                    {isOnline(selectedUser._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                      message.senderId === user?._id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p>{message.text}</p>
                    {message.image && (
                      <img src={message.image} alt="attachment" className="mt-2 rounded-lg max-w-full" />
                    )}
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Button variant="ghost" size="sm" type="button">
                  <Plus className="h-5 w-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-500">Choose a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
