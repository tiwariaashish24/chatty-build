import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { useTheme } from '@/contexts/ThemeContext';
import { messageService } from '@/services/message.service';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {
  ArrowLeft,
  Send,
  Search,
  LogOut,
  Users,
  MessageSquare,
  Sun,
  Moon,
  Monitor,
  BarChart3,
  UserPlus,
  Settings,
  Image as ImageIcon,
} from 'lucide-react';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const { onlineUsers, socket } = useSocket();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const loadUsers = useCallback(async () => {
    try {
      const data = await messageService.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (userId) => {
    try {
      const data = await messageService.getMessages(userId);
      setMessages(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load messages');
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // User data is fetched after mount and updates local view state on completion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (selectedUser) {
      // Fetching a selected conversation synchronizes the view with server state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMessages(selectedUser._id);
    }
  }, [selectedUser, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!socket || !selectedUser) return undefined;

    const selectedUserId = selectedUser._id;
    const currentUserId = user?._id;
    const getId = (value) => (typeof value === 'string' ? value : value?._id);
    const isCurrentConversation = (message) =>
      [getId(message.senderId), getId(message.reciverId)].includes(selectedUserId) &&
      [getId(message.senderId), getId(message.reciverId)].includes(currentUserId);
    const handleReceiveMessage = (message) => {
      if (!isCurrentConversation(message)) return;
      setMessages((currentMessages) =>
        currentMessages.some((currentMessage) => currentMessage._id === message._id)
          ? currentMessages
          : [...currentMessages, message],
      );
    };
    const handleMessageDeleted = ({ messageId }) => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message._id === messageId ? { ...message, isDeleted: true } : message,
        ),
      );
    };
    const handleMessageEdited = (updatedMessage) => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message._id === updatedMessage._id ? updatedMessage : message,
        ),
      );
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageEdited', handleMessageEdited);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageEdited', handleMessageEdited);
    };
  }, [socket, selectedUser, user?._id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedUser) return;

    try {
      const messageData = {};
      if (newMessage.trim()) messageData.text = newMessage;
      if (selectedImage) messageData.image = selectedImage;

      const message = await messageService.sendMessage(selectedUser._id, messageData);
      setMessages((currentMessages) =>
        currentMessages.some((currentMessage) => currentMessage._id === message._id)
          ? currentMessages
          : [...currentMessages, message],
      );
      setNewMessage('');
      setSelectedImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send message');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isOnline = (userId) => onlineUsers.includes(userId);
  const filteredUsers = users.filter((conversationUser) =>
    `${conversationUser.fullName} ${conversationUser.email}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase()),
  );
  const selectUser = (conversationUser) => {
    if (selectedUser?._id === conversationUser._id) {
      loadMessages(conversationUser._id);
    } else {
      setMessages([]);
    }
    setSelectedUser(conversationUser);
    if (window.matchMedia('(max-width: 767px)').matches) {
      setShowSidebar(false);
    }
  };

  return (
    <div className={`chat-layout ${selectedUser ? 'has-selection' : ''} bg-[#1a1915]`}>
      {/* Sidebar */}
      <div
        className={`chat-sidebar ${showSidebar ? 'is-open' : 'is-closed'} border-r border-[#3c3a36] bg-[#2a2824]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3c3a36] p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profilePic} alt={user?.fullName} size="lg" online={isOnline(user?._id)} />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-gray-100">{user?.fullName}</h2>
              <p className="text-xs text-gray-400">Your account</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/friends')}
              aria-label="Friends"
              title="Friends"
              className="text-gray-200 hover:bg-[#3c3a36]"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/rooms')}
              aria-label="Open rooms"
              title="Open rooms"
              className="text-gray-200 hover:bg-[#3c3a36]"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              aria-label="Dashboard"
              title="Dashboard"
              className="text-gray-200 hover:bg-[#3c3a36]"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              title="Settings"
              className="text-gray-200 hover:bg-[#3c3a36]"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Theme"
                  title="Theme"
                  className="text-gray-200 hover:bg-[#3c3a36]"
                >
                  {theme === 'light' && <Sun className="h-5 w-5" />}
                  {theme === 'dark' && <Moon className="h-5 w-5" />}
                  {theme === 'system' && <Monitor className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#2a2824] border-[#3c3a36]">
                <DropdownMenuItem
                  onClick={() => setTheme('light')}
                  className="text-gray-200 hover:bg-[#3c3a36] focus:bg-[#3c3a36]"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme('dark')}
                  className="text-gray-200 hover:bg-[#3c3a36] focus:bg-[#3c3a36]"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme('system')}
                  className="text-gray-200 hover:bg-[#3c3a36] focus:bg-[#3c3a36]"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="text-gray-200 hover:bg-[#3c3a36]"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder="Search conversations"
              aria-label="Search users"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 border-[#3c3a36] bg-[#1a1915] pl-9 text-gray-100 placeholder:text-gray-500 focus-visible:bg-[#1a1915]"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto px-2">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-400">Loading conversations…</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">
              {users.length === 0 ? 'No conversations yet.' : 'No users match your search.'}
            </div>
          ) : (
            filteredUsers.map((u) => (
              <button
                key={u._id}
                type="button"
                onClick={() => selectUser(u)}
                className={`w-full rounded-xl p-3 text-left transition-colors hover:bg-[#3c3a36] ${
                  selectedUser?._id === u._id ? 'bg-[#3c3a36]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.profilePic} alt={u.fullName} online={isOnline(u._id)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate text-sm font-semibold text-gray-100">{u.fullName}</h3>
                      {isOnline(u._id) && <Badge variant="success">Online</Badge>}
                    </div>
                    <p className="truncate text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-main bg-[#1a1915]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between gap-2 border-b border-[#3c3a36] bg-[#2a2824] px-3 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowSidebar(true)}
                  aria-label="Show conversations"
                  className="chat-icon-button shrink-0 hover:bg-[#3c3a36] md:hidden text-gray-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar src={selectedUser.profilePic} alt={selectedUser.fullName} online={isOnline(selectedUser._id)} />
                <div className="chat-header-details">
                  <h2 className="text-sm font-semibold text-gray-100">{selectedUser.fullName}</h2>
                  <p className="text-xs text-gray-400">
                    {isOnline(selectedUser._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages flex-1 space-y-4 bg-[#1a1915] p-4 sm:p-6">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`chat-message rounded-lg p-3 ${
                      message.senderId === user?._id
                        ? 'rounded-br-sm bg-[#6366f1] text-gray-100 shadow-sm'
                        : 'rounded-bl-sm border border-[#3c3a36] bg-[#2a2824] text-gray-100 shadow-sm'
                    }`}
                  >
                    <p>{message.isDeleted ? 'Message deleted' : message.text}</p>
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
            <div className="border-t border-[#3c3a36] bg-[#2a2824] p-3 sm:p-4">
              {selectedImage && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-h-32 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-gray-100 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="mx-auto flex max-w-4xl gap-2">
                <label className="cursor-pointer">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-200 hover:bg-[#3c3a36]"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  aria-label="Type a message"
                  className="flex-1 bg-[#1a1915] border-[#3c3a36] text-gray-100 placeholder:text-gray-500"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send message"
                  disabled={!newMessage.trim() && !selectedImage}
                  className="bg-[#6366f1] hover:bg-[#5558e3]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#1a1915] p-6">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-[#6366f1]/20 text-[#6366f1]">
                <MessageSquare className="size-7" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-gray-100">Your conversations, together</h2>
              <p className="text-sm leading-6 text-gray-400">Choose someone from your conversations to pick up where you left off.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
