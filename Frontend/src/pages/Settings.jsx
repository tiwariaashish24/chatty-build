import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import Avatar from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Label } from '@/components/ui/label.tsx';
import {
  ArrowLeft,
  User,
  Camera,
  Save,
  LogOut,
  Copy,
  Check,
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    profilePic: user?.profilePic || '',
  });

  useEffect(() => {
    loadInviteCode();
  }, []);

  const loadInviteCode = async () => {
    try {
      const data = await userService.generateInviteCode();
      setInviteCode(data.inviteCode);
    } catch (error) {
      console.error('Failed to load invite code:', error);
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // In a real app, you would upload to Cloudinary here
    // For now, we'll use a placeholder
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, profilePic: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#1a1915]">
      {/* Header */}
      <div className="border-b border-[#3c3a36] bg-[#2a2824] px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
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
            <h1 className="text-xl font-semibold text-gray-100">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Card */}
        <Card className="bg-[#2a2824] border-[#3c3a36]">
          <CardHeader>
            <CardTitle className="text-gray-100">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar
                    src={formData.profilePic}
                    alt={formData.fullName}
                    size="xl"
                    className="h-24 w-24"
                  />
                  <label
                    htmlFor="profile-pic"
                    className="absolute bottom-0 right-0 p-2 bg-[#6366f1] rounded-full cursor-pointer hover:bg-[#5558e3] transition-colors"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </label>
                  <input
                    id="profile-pic"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">{formData.fullName}</h3>
                  <p className="text-sm text-gray-400">{formData.email}</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-200">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-[#1a1915] border-[#3c3a36] text-gray-100"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-200">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Choose a unique username"
                  className="bg-[#1a1915] border-[#3c3a36] text-gray-100"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-200">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  rows={4}
                  className="bg-[#1a1915] border-[#3c3a36] text-gray-100 resize-none"
                />
                <p className="text-xs text-gray-400">{formData.bio.length}/500</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-[#6366f1] hover:bg-[#5558e3]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invite Card */}
        <Card className="bg-[#2a2824] border-[#3c3a36]">
          <CardHeader>
            <CardTitle className="text-gray-100">Invite Friends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              Share your unique invite link with friends to add them directly to your contacts.
            </p>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/invite/${inviteCode}`}
                readOnly
                className="bg-[#1a1915] border-[#3c3a36] text-gray-100 flex-1"
              />
              <Button
                onClick={handleCopyInviteLink}
                variant="outline"
                className="border-[#3c3a36] text-gray-200 hover:bg-[#3c3a36]"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-[#2a2824] border-[#3c3a36]">
          <CardHeader>
            <CardTitle className="text-gray-100">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
