import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { userService } from '@/services/user.service';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.tsx';
import {
  ArrowLeft,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Users,
} from 'lucide-react';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { onlineUsers, socket } = useSocket();
  const navigate = useNavigate();

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const loadFriends = useCallback(async () => {
    try {
      const data = await userService.getFriends();
      setFriends(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load friends');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFriendRequests = useCallback(async () => {
    try {
      const data = await userService.getFriendRequests();
      setFriendRequests(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load friend requests');
    }
  }, []);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [loadFriends, loadFriendRequests]);

  useEffect(() => {
    if (!socket) return;

    const handleFriendRequestReceived = ({ senderId }) => {
      loadFriendRequests();
      toast.success('New friend request received!');
    };

    const handleFriendRequestAccepted = ({ recipientId }) => {
      loadFriends();
      toast.success('Friend request accepted!');
    };

    socket.on('friendRequestReceived', handleFriendRequestReceived);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);

    return () => {
      socket.off('friendRequestReceived', handleFriendRequestReceived);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
    };
  }, [socket, loadFriendRequests, loadFriends]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await userService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Search failed');
    }
  };

  const handleSendFriendRequest = async (recipientId) => {
    try {
      await userService.sendFriendRequest(recipientId);
      toast.success('Friend request sent!');
      setSearchResults(searchResults.filter((u) => u._id !== recipientId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send friend request');
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      await userService.acceptFriendRequest(senderId);
      toast.success('Friend added!');
      setFriendRequests(friendRequests.filter((req) => req._id !== senderId));
      loadFriends();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not accept request');
    }
  };

  const handleRejectRequest = async (senderId) => {
    try {
      await userService.rejectFriendRequest(senderId);
      toast.success('Request rejected');
      setFriendRequests(friendRequests.filter((req) => req._id !== senderId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reject request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await userService.removeFriend(friendId);
      toast.success('Friend removed');
      setFriends(friends.filter((f) => f._id !== friendId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove friend');
    }
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div className="min-h-screen bg-[#1a1915]">
      {/* Header */}
      <div className="border-b border-[#3c3a36] bg-[#2a2824] px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate('/chat')}
              aria-label="Back to chat"
              className="text-gray-200 hover:bg-[#3c3a36]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-100">Friends</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
          <TabsList className="bg-[#2a2824] border border-[#3c3a36] p-1">
            <TabsTrigger
              value="friends"
              className="data-[state=active]:bg-[#3c3a36] data-[state=active]:text-gray-100 text-gray-400"
            >
              <Users className="h-4 w-4 mr-2" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-[#3c3a36] data-[state=active]:text-gray-100 text-gray-400"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Requests ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger
              value="add"
              className="data-[state=active]:bg-[#3c3a36] data-[state=active]:text-gray-100 text-gray-400"
            >
              <Search className="h-4 w-4 mr-2" />
              Add Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading friends...</div>
              ) : friends.length === 0 ? (
                <Card className="bg-[#2a2824] border-[#3c3a36]">
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-100 mb-2">No friends yet</h3>
                    <p className="text-gray-400 mb-4">
                      Start by adding friends to chat with them
                    </p>
                    <Button
                      onClick={() => setActiveTab('add')}
                      className="bg-[#6366f1] hover:bg-[#5558e3]"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friends
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                friends.map((friend) => (
                  <Card
                    key={friend._id}
                    className="bg-[#2a2824] border-[#3c3a36] hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={friend.profilePic}
                            alt={friend.fullName}
                            online={isOnline(friend._id)}
                            size="lg"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-100">{friend.fullName}</h3>
                            <p className="text-sm text-gray-400">{friend.email}</p>
                            {isOnline(friend._id) && (
                              <Badge variant="success" className="mt-1">Online</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/chat?user=${friend._id}`)}
                            className="text-gray-200 hover:bg-[#3c3a36]"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFriend(friend._id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="space-y-4">
              {friendRequests.length === 0 ? (
                <Card className="bg-[#2a2824] border-[#3c3a36]">
                  <CardContent className="text-center py-12">
                    <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-100 mb-2">No pending requests</h3>
                    <p className="text-gray-400">
                      When someone sends you a friend request, it will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                friendRequests.map((request) => (
                  <Card
                    key={request._id}
                    className="bg-[#2a2824] border-[#3c3a36]"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={request.profilePic}
                            alt={request.fullName}
                            online={isOnline(request._id)}
                            size="lg"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-100">{request.fullName}</h3>
                            <p className="text-sm text-gray-400">{request.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request._id)}
                            className="bg-[#6366f1] hover:bg-[#5558e3]"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRejectRequest(request._id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <div className="space-y-6">
              {/* Invite Link Section */}
              <Card className="bg-[#2a2824] border-[#3c3a36]">
                <CardContent className="p-4">
                  <h3 className="text-gray-100 font-semibold mb-3">Invite via Link</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Share your unique invite link to add friends directly
                  </p>
                  <Button
                    onClick={() => navigate('/settings')}
                    variant="outline"
                    className="border-[#3c3a36] text-gray-200 hover:bg-[#3c3a36] w-full"
                  >
                    Get Invite Link
                  </Button>
                </CardContent>
              </Card>

              {/* Search Section */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-9 bg-[#1a1915] border-[#3c3a36] text-gray-100 placeholder:text-gray-500"
                  />
                </div>

                {searchQuery.length < 2 && (
                  <div className="text-center py-8 text-gray-400">
                    Type at least 2 characters to search for users
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No users found matching your search
                  </div>
                )}

                {searchResults.map((result) => (
                  <Card
                    key={result._id}
                    className="bg-[#2a2824] border-[#3c3a36]"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={result.profilePic}
                            alt={result.fullName}
                            online={isOnline(result._id)}
                            size="lg"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-100">{result.fullName}</h3>
                            <p className="text-sm text-gray-400">{result.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendFriendRequest(result._id)}
                          className="bg-[#6366f1] hover:bg-[#5558e3]"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
