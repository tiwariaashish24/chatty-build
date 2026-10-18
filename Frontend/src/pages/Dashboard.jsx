import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services/user.service';
import { messageService } from '@/services/message.service';
import { roomService } from '@/services/room.service';
import Avatar from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Hash,
  TrendingUp,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFriends: 0,
    totalMessages: 0,
    totalRooms: 0,
    onlineFriends: 0,
  });
  const [messageData, setMessageData] = useState([]);
  const [friendActivityData, setFriendActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadStats = useCallback(async () => {
    try {
      const [friends, messages, rooms] = await Promise.all([
        userService.getFriends(),
        messageService.getUsers(),
        roomService.getRooms(),
      ]);

      const onlineCount = friends.filter((f) => f.isOnline).length;

      setStats({
        totalFriends: friends.length,
        totalMessages: messages.length,
        totalRooms: rooms.length,
        onlineFriends: onlineCount,
      });

      // Generate mock message data for the chart (last 7 days)
      const messageChartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        messageChartData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          messages: Math.floor(Math.random() * 50) + 10,
        });
      }
      setMessageData(messageChartData);

      // Generate mock friend activity data
      const activityData = [
        { name: 'Online', value: onlineCount },
        { name: 'Offline', value: friends.length - onlineCount },
      ];
      setFriendActivityData(activityData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card className="bg-[#2a2824] border-[#3c3a36] hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-100">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1915] flex items-center justify-center">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1915]">
      {/* Header */}
      <div className="border-b border-[#3c3a36] bg-[#2a2824] px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
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
            <h1 className="text-xl font-semibold text-gray-100">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Avatar src={user?.profilePic} alt={user?.fullName} size="md" />
            <div>
              <p className="text-sm font-medium text-gray-100">{user?.fullName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Friends"
            value={stats.totalFriends}
            color="bg-indigo-500"
          />
          <StatCard
            icon={MessageSquare}
            label="Total Messages"
            value={stats.totalMessages}
            color="bg-green-500"
          />
          <StatCard
            icon={Hash}
            label="Active Rooms"
            value={stats.totalRooms}
            color="bg-yellow-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Online Friends"
            value={stats.onlineFriends}
            color="bg-purple-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Activity Chart */}
          <Card className="bg-[#2a2824] border-[#3c3a36]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-100">Message Activity</CardTitle>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={messageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3c3a36" />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2a2824',
                      border: '1px solid #3c3a36',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                    }}
                  />
                  <Bar dataKey="messages" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Friend Activity Chart */}
          <Card className="bg-[#2a2824] border-[#3c3a36]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-100">Friend Status</CardTitle>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={friendActivityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {friendActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2a2824',
                      border: '1px solid #3c3a36',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-[#2a2824] border-[#3c3a36]">
          <CardHeader>
            <CardTitle className="text-gray-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate('/chat')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#5558e3]"
              >
                <MessageSquare className="h-6 w-6" />
                <span>Go to Chat</span>
              </Button>
              <Button
                onClick={() => navigate('/friends')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 border-[#3c3a36] text-gray-200 hover:bg-[#3c3a36]"
              >
                <Users className="h-6 w-6" />
                <span>Manage Friends</span>
              </Button>
              <Button
                onClick={() => navigate('/rooms')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 border-[#3c3a36] text-gray-200 hover:bg-[#3c3a36]"
              >
                <Hash className="h-6 w-6" />
                <span>Browse Rooms</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
