import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { messageService } from '@/services/message.service';
import { uploadService } from '@/services/upload.service';
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
  Send,
  Search,
  MessageSquare,
  Image as ImageIcon,
  Paperclip,
  MapPin,
  Video,
  FileText,
  Mic,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [location, setLocation] = useState(null);
  const [isViewOnce, setIsViewOnce] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { onlineUsers, socket } = useSocket();
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
    if ((!newMessage.trim() && !selectedImage && attachments.length === 0 && !location) || !selectedUser) return;

    try {
      const messageData = {};
      if (newMessage.trim()) messageData.text = newMessage;
      if (selectedImage) messageData.attachments = [{
        url: selectedImage,
        type: 'image',
        name: 'image',
      }];
      if (attachments.length > 0) messageData.attachments = attachments;
      if (location) messageData.location = location;
      if (isViewOnce) messageData.isViewOnce = true;

      const message = await messageService.sendMessage(selectedUser._id, messageData);
      setMessages((currentMessages) =>
        currentMessages.some((currentMessage) => currentMessage._id === message._id)
          ? currentMessages
          : [...currentMessages, message],
      );
      setNewMessage('');
      setSelectedImage(null);
      setAttachments([]);
      setLocation(null);
      setIsViewOnce(false);
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

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(true);
      const uploadedFile = await uploadService.uploadFile(file);

      setAttachments([...attachments, {
        url: uploadedFile.url,
        type: type,
        name: uploadedFile.originalName,
        size: uploadedFile.size,
        mimeType: uploadedFile.mimeType,
        publicId: uploadedFile.publicId,
      }]);

      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Get address using reverse geocoding (using OpenStreetMap Nominatim)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();

          setLocation({
            latitude,
            longitude,
            address: data.display_name || 'Unknown location',
            placeName: data.address?.city || data.address?.town || 'Unknown',
          });

          toast.success('Location captured');
          } catch (error) {
            setLocation({
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              placeName: 'Shared location',
            });
            toast.success('Location captured');
          }
        },
        (error) => {
          toast.error('Failed to get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const clearAttachments = () => {
    setAttachments([]);
    setLocation(null);
    setSelectedImage(null);
    setIsViewOnce(false);
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
    <div className="flex h-full bg-[#0F172A]">
      {/* Conversation List Sidebar */}
      <div className="w-80 border-r border-[rgba(148,163,184,0.16)] flex flex-col bg-[#172338]">
        {/* Search */}
        <div className="p-4 border-b border-[rgba(148,163,184,0.16)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <Input
              type="search"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#0F172A] border-[rgba(148,163,184,0.16)] text-[#F8FAFC] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-[#94A3B8]">Loading conversations...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#94A3B8]">
              {users.length === 0 ? 'No conversations yet.' : 'No users match your search.'}
            </div>
          ) : (
            filteredUsers.map((u) => (
              <button
                key={u._id}
                type="button"
                onClick={() => selectUser(u)}
                className={`w-full p-4 text-left transition-colors hover:bg-[#243247] border-b border-[rgba(148,163,184,0.16)] ${
                  selectedUser?._id === u._id ? 'bg-[#243247]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={u.profilePic} alt={u.fullName} online={isOnline(u._id)} size="lg" />
                    {isOnline(u._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#172338]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate text-sm font-semibold text-[#F8FAFC]">{u.fullName}</h3>
                      {isOnline(u._id) && (
                        <span className="text-xs text-[#22C55E]">Online</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-[#94A3B8]">{u.email}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0F172A]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(148,163,184,0.16)] bg-[#172338]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar src={selectedUser.profilePic} alt={selectedUser.fullName} online={isOnline(selectedUser._id)} size="lg" />
                  {isOnline(selectedUser._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#172338]" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">{selectedUser.fullName}</h2>
                  <p className="text-xs text-[#94A3B8]">
                    {isOnline(selectedUser._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6"
              style={{
                backgroundImage: user?.chatBackground ? `url(${user.chatBackground})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-4 ${
                      message.senderId === user?._id
                        ? 'rounded-br-sm bg-[#4F7CFF] text-[#F8FAFC]'
                        : 'rounded-bl-sm bg-[#1E293B] text-[#F8FAFC] border border-[rgba(148,163,184,0.16)]'
                    }`}
                  >
                    {message.isDeleted ? (
                      <p className="text-sm">Message deleted</p>
                    ) : (
                      <>
                        {message.text && <p className="mb-2 text-sm">{message.text}</p>}

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2">
                            {message.attachments.map((attachment, idx) => (
                              <div key={idx}>
                                {attachment.type === 'image' && (
                                  <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="rounded-lg max-w-full max-h-64 object-cover"
                                  />
                                )}
                                {attachment.type === 'video' && (
                                  <video
                                    src={attachment.url}
                                    controls
                                    className="rounded-lg max-w-full max-h-64"
                                  />
                                )}
                                {attachment.type === 'audio' && (
                                  <audio
                                    src={attachment.url}
                                    controls
                                    className="w-full"
                                  />
                                )}
                                {attachment.type === 'document' && (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-[#0F172A] rounded-lg hover:bg-[#243247] transition-colors"
                                  >
                                    <FileText className="h-5 w-5" />
                                    <span className="text-sm">{attachment.name}</span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Location */}
                        {message.location && (
                          <div className="mt-2">
                            <a
                              href={`https://www.google.com/maps?q=${message.location.latitude},${message.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-[#0F172A] rounded-lg hover:bg-[#243247] transition-colors"
                            >
                              <MapPin className="h-5 w-5 text-[#EF4444]" />
                              <div>
                                <p className="text-sm font-medium">{message.location.placeName}</p>
                                <p className="text-xs text-[#94A3B8]">{message.location.address}</p>
                              </div>
                            </a>
                          </div>
                        )}

                        {/* View-once indicator */}
                        {message.isViewOnce && (
                          <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                            <Eye className="h-3 w-3" />
                            <span>View once</span>
                          </div>
                        )}

                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-[rgba(148,163,184,0.16)] bg-[#172338] p-4">
              {/* Attachments Preview */}
              {(selectedImage || attachments.length > 0 || location) && (
                <div className="mb-3 space-y-2">
                  {selectedImage && (
                    <div className="relative inline-block">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="max-h-32 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-1 right-1 p-1 bg-[#EF4444] rounded-full text-[#F8FAFC] hover:bg-[#DC2626]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {attachments.map((attachment, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-[#0F172A] rounded-lg"
                    >
                      {attachment.type === 'image' && <ImageIcon className="h-4 w-4" />}
                      {attachment.type === 'video' && <Video className="h-4 w-4" />}
                      {attachment.type === 'audio' && <Mic className="h-4 w-4" />}
                      {attachment.type === 'document' && <FileText className="h-4 w-4" />}
                      <span className="text-sm text-[#F8FAFC] flex-1 truncate">{attachment.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-[#EF4444] hover:text-[#DC2626]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {location && (
                    <div className="flex items-center gap-2 p-2 bg-[#0F172A] rounded-lg">
                      <MapPin className="h-4 w-4 text-[#EF4444]" />
                      <span className="text-sm text-[#F8FAFC] flex-1 truncate">{location.placeName}</span>
                      <button
                        type="button"
                        onClick={() => setLocation(null)}
                        className="text-[#EF4444] hover:text-[#DC2626]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={clearAttachments}
                    className="text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                  >
                    Clear all
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                {/* Attachment Menu */}
                <DropdownMenu open={showAttachmentMenu} onOpenChange={setShowAttachmentMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#243247]"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1E293B] border-[rgba(148,163,184,0.16)] w-56">
                    <DropdownMenuItem
                      onClick={() => {
                        document.getElementById('image-upload').click();
                        setShowAttachmentMenu(false);
                      }}
                      className="text-[#F8FAFC] hover:bg-[#243247] focus:bg-[#243247]"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Image
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        document.getElementById('video-upload').click();
                        setShowAttachmentMenu(false);
                      }}
                      className="text-[#F8FAFC] hover:bg-[#243247] focus:bg-[#243247]"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        document.getElementById('audio-upload').click();
                        setShowAttachmentMenu(false);
                      }}
                      className="text-[#F8FAFC] hover:bg-[#243247] focus:bg-[#243247]"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Audio
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        document.getElementById('document-upload').click();
                        setShowAttachmentMenu(false);
                      }}
                      className="text-[#F8FAFC] hover:bg-[#243247] focus:bg-[#243247]"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Document
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        handleLocationShare();
                        setShowAttachmentMenu(false);
                      }}
                      className="text-[#F8FAFC] hover:bg-[#243247] focus:bg-[#243247]"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsViewOnce(!isViewOnce);
                        setShowAttachmentMenu(false);
                      }}
                      className="text-[#F8FAFC] hover:bg-[#243247] focus:bg-[#243247]"
                    >
                      {isViewOnce ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {isViewOnce ? 'Disable View Once' : 'View Once'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Hidden file inputs */}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileUpload(file, 'image');
                  }}
                  className="hidden"
                />
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileUpload(file, 'video');
                  }}
                  className="hidden"
                />
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileUpload(file, 'audio');
                  }}
                  className="hidden"
                />
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileUpload(file, 'document');
                  }}
                  className="hidden"
                />

                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  aria-label="Type a message"
                  className="flex-1 bg-[#0F172A] border-[rgba(148,163,184,0.16)] text-[#F8FAFC] placeholder:text-[#94A3B8]"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send message"
                  disabled={!newMessage.trim() && !selectedImage && attachments.length === 0 && !location}
                  className="bg-[#4F7CFF] hover:bg-[#3D5BC7]"
                >
                  {uploading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-[#F8FAFC] border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0F172A] p-6">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-[#4F7CFF]/20 text-[#4F7CFF]">
                <MessageSquare className="size-7" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-[#F8FAFC]">Your conversations, together</h2>
              <p className="text-sm leading-6 text-[#94A3B8]">Choose someone from your conversations to pick up where you left off.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
