import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { roomService } from '@/services/room.service';
import { messageService } from '@/services/message.service';
import Avatar from '@/components/ui/Avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button.tsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Plus,
  Search,
  LogOut,
  MessageSquare,
  Hash,
  Lock,
  Globe,
  Trash2,
} from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    description: '',
    type: 'text',
    isPrivate: false,
  });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { joinRoom, leaveRoom, socket } = useSocket();
  const navigate = useNavigate();

  const loadRooms = useCallback(async () => {
    try {
      const data = await roomService.getUserRooms();
      setRooms(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoomMessages = useCallback(async (roomId) => {
    try {
      const data = await messageService.getRoomMessages(roomId);
      setMessages(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load room messages');
    }
  }, []);

  useEffect(() => {
    // Room data is fetched after mount and updates local view state on completion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (selectedRoom) {
      joinRoom(selectedRoom._id);
      // Fetching selected room messages synchronizes the view with server state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRoomMessages(selectedRoom._id);
      return () => leaveRoom(selectedRoom._id);
    }
    return undefined;
  }, [selectedRoom, joinRoom, leaveRoom, loadRoomMessages]);

  useEffect(() => {
    if (!socket || !selectedRoom) return undefined;

    const handleReceiveMessage = (message) => {
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

    socket.on('receiveRoomMessage', handleReceiveMessage);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageEdited', handleMessageEdited);

    return () => {
      socket.off('receiveRoomMessage', handleReceiveMessage);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageEdited', handleMessageEdited);
    };
  }, [socket, selectedRoom]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreatingRoom(true);
    try {
      const room = await roomService.createRoom(newRoomData);
      setMessages([]);
      setSelectedRoom(room);
      if (window.matchMedia('(max-width: 767px)').matches) {
        setShowSidebar(false);
      }
      setShowCreateModal(false);
      setNewRoomData({ name: '', description: '', type: 'text', isPrivate: false });
      await loadRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create room');
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const message = await messageService.sendRoomMessage(selectedRoom._id, {
        text: newMessage,
      });
      setMessages((currentMessages) =>
        currentMessages.some((currentMessage) => currentMessage._id === message._id)
          ? currentMessages
          : [...currentMessages, message],
      );
      setNewMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send message');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    setDeletingRoom(true);
    try {
      await roomService.deleteRoom(roomToDelete._id);
      setMessages([]);
      setSelectedRoom(null);
      setShowSidebar(true);
      setRoomToDelete(null);
      await loadRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete room');
    } finally {
      setDeletingRoom(false);
    }
  };
  const filteredRooms = rooms.filter((room) =>
    `${room.name} ${room.description || ''}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase()),
  );
  const selectRoom = (room) => {
    if (selectedRoom?._id === room._id) {
      loadRoomMessages(room._id);
    } else {
      setMessages([]);
    }
    setSelectedRoom(room);
    if (window.matchMedia('(max-width: 767px)').matches) {
      setShowSidebar(false);
    }
  };
  const roomCreatorId = selectedRoom?.createdBy?._id || selectedRoom?.createdBy;

  return (
    <div className={`chat-layout ${selectedRoom ? 'has-selection' : ''}`}>
      {/* Sidebar */}
      <div
        className={`chat-sidebar ${showSidebar ? 'is-open' : 'is-closed'} border-r border-slate-100`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profilePic} alt={user?.fullName} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-slate-900">{user?.fullName}</h2>
              <p className="text-xs text-slate-500">Your account</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate('/chat')}
              aria-label="Open direct messages"
              title="Open direct messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Log out" title="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Create Room Button */}
        <div className="p-4">
          <Button onClick={() => setShowCreateModal(true)} className="w-full">
            <Plus />
            Create Room
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search rooms"
              aria-label="Search rooms"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 border-transparent bg-slate-50 pl-9 shadow-none focus-visible:bg-white"
            />
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto px-2">
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading rooms…</div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              {rooms.length === 0 ? 'No rooms yet. Create one to get started.' : 'No rooms match your search.'}
            </div>
          ) : (
            filteredRooms.map((room) => (
              <button
                key={room._id}
                type="button"
                onClick={() => selectRoom(room)}
                className={`w-full rounded-xl p-3 text-left transition-colors hover:bg-slate-50 ${
                  selectedRoom?._id === room._id ? 'bg-indigo-50/80' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Hash className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate text-sm font-semibold text-slate-800">{room.name}</h3>
                      {room.isPrivate ? (
                        <Lock className="size-3.5 text-slate-400" />
                      ) : (
                        <Globe className="size-3.5 text-slate-400" />
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">{room.description}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {room.members?.length ?? 0} members
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <Button
                  type="button"
                  onClick={() => setShowSidebar(true)}
                  aria-label="Show rooms"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 md:hidden"
                >
                  <ArrowLeft />
                </Button>
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Hash className="size-4" />
                </div>
                <div className="chat-header-details">
                  <h2 className="font-semibold text-gray-900">{selectedRoom.name}</h2>
                  <p className="text-sm text-gray-500">{selectedRoom.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(roomCreatorId === user?._id) && (
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => setRoomToDelete(selectedRoom)}
                    aria-label="Delete room"
                    title="Delete room"
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages flex-1 space-y-4 bg-slate-50/80 p-4 sm:p-6">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex gap-2 min-w-0 max-w-full">
                    {message.senderId !== user?._id && (
                      <Avatar src={message.senderId?.profilePic} alt={message.senderId?.fullName} size="sm" />
                    )}
                    <div
                      className={`chat-message rounded-lg p-3 ${
                        message.senderId === user?._id
                          ? 'rounded-br-sm bg-indigo-600 text-white shadow-sm'
                          : 'rounded-bl-sm border border-slate-100 bg-white text-slate-800 shadow-sm'
                      }`}
                    >
                      {message.senderId !== user?._id && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {message.senderId?.fullName}
                        </p>
                      )}
                      <p>{message.isDeleted ? 'Message deleted' : message.text}</p>
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
            <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
              <form onSubmit={handleSendMessage} className="mx-auto flex max-w-4xl gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${selectedRoom.name}`}
                  aria-label={`Message ${selectedRoom.name}`}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send message"
                  disabled={!newMessage.trim()}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-slate-50/80 p-6">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Hash className="size-7" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-slate-900">A space for every conversation</h2>
              <p className="text-sm leading-6 text-slate-500">Choose a room to catch up with your group or create a new space for your people.</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a room</DialogTitle>
            <DialogDescription>
              Start a new space for a group, project, or the people you care about.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRoom} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                value={newRoomData.name}
                onChange={(event) => setNewRoomData({ ...newRoomData, name: event.target.value })}
                placeholder="The weekend crew"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input
                id="room-description"
                value={newRoomData.description}
                onChange={(event) => setNewRoomData({ ...newRoomData, description: event.target.value })}
                placeholder="What will you talk about?"
              />
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border p-3.5">
              <Checkbox
                id="isPrivate"
                checked={newRoomData.isPrivate}
                onCheckedChange={(checked) => setNewRoomData({ ...newRoomData, isPrivate: checked === true })}
              />
              <div className="grid gap-1">
                <Label htmlFor="isPrivate" className="cursor-pointer">Private room</Label>
                <p className="text-xs leading-5 text-muted-foreground">Only invited members can join this room.</p>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={creatingRoom}>
              {creatingRoom ? 'Creating room…' : 'Create Room'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(roomToDelete)}
        onOpenChange={(open) => {
          if (!open && !deletingRoom) setRoomToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove “{roomToDelete?.name}” and its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingRoom}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletingRoom}
              onClick={(event) => {
                event.preventDefault();
                handleDeleteRoom();
              }}
            >
              {deletingRoom ? 'Deleting…' : 'Delete room permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Rooms;
