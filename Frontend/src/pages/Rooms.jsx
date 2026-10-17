import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { roomService } from '@/services/room.service';
import { messageService } from '@/services/message.service';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import {
  Plus,
  Search,
  LogOut,
  Users,
  MessageSquare,
  Hash,
  Lock,
  Globe,
  Settings,
  UserPlus,
  UserMinus,
  Trash2,
} from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    description: '',
    type: 'text',
    isPrivate: false,
  });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { joinRoom, leaveRoom } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      joinRoom(selectedRoom._id);
      loadRoomMessages(selectedRoom._id);
      return () => leaveRoom(selectedRoom._id);
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      const data = await roomService.getUserRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoomMessages = async (roomId) => {
    try {
      const data = await messageService.getRoomMessages(roomId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load room messages:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await roomService.createRoom(newRoomData);
      setShowCreateModal(false);
      setNewRoomData({ name: '', description: '', type: 'text', isPrivate: false });
      loadRooms();
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const message = await messageService.sendRoomMessage(selectedRoom._id, {
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

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomService.deleteRoom(roomId);
        setSelectedRoom(null);
        loadRooms();
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

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
            <Avatar src={user?.profilePic} size="lg" />
            <div>
              <h2 className="font-semibold text-gray-900">{user?.fullName}</h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/chat')}>
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Create Room Button */}
        <div className="p-4">
          <Button onClick={() => setShowCreateModal(true)} className="w-full">
            <Plus className="h-5 w-5 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading rooms...</div>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedRoom?._id === room._id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Hash className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
                      {room.isPrivate ? (
                        <Lock className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{room.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {room.members?.length} members
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
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
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Hash className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedRoom.name}</h2>
                  <p className="text-sm text-gray-500">{selectedRoom.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5" />
                </Button>
                {selectedRoom.createdBy === user?._id && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteRoom(selectedRoom._id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex gap-2 max-w-xs md:max-w-md lg:max-w-lg">
                    {message.senderId !== user?._id && (
                      <Avatar src={message.senderId?.profilePic} size="sm" />
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        message.senderId === user?._id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      {message.senderId !== user?._id && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {message.senderId?.fullName}
                        </p>
                      )}
                      <p>{message.text}</p>
                      {message.image && (
                        <img src={message.image} alt="attachment" className="mt-2 rounded-lg max-w-full" />
                      )}
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
                  placeholder={`Message #${selectedRoom.name}`}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Hash className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a room</h2>
              <p className="text-gray-500">Choose a room from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Room"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <Input
            label="Room Name"
            value={newRoomData.name}
            onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
            placeholder="My Awesome Room"
            required
          />
          <Input
            label="Description"
            value={newRoomData.description}
            onChange={(e) => setNewRoomData({ ...newRoomData, description: e.target.value })}
            placeholder="What's this room about?"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={newRoomData.isPrivate}
              onChange={(e) => setNewRoomData({ ...newRoomData, isPrivate: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-700">
              Private Room
            </label>
          </div>
          <Button type="submit" className="w-full">
            Create Room
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Rooms;
