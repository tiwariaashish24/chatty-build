import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { UserPlus, Check } from 'lucide-react';

const Invite = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [inviterName, setInviterName] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleAcceptInvite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const data = await userService.acceptInvite(inviteCode);
      setInviterName(data.inviter);
      setAccepted(true);
      toast.success('Friend added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept invite');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1915] flex items-center justify-center">
        <div className="text-gray-400">Please login to accept the invite...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1915] flex items-center justify-center p-4">
      <Card className="bg-[#2a2824] border-[#3c3a36] max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-gray-100 text-center">
            {accepted ? 'Invite Accepted!' : 'You\'ve Been Invited!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!accepted ? (
            <>
              <div className="text-center">
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#6366f1]/20 text-[#6366f1]">
                  <UserPlus className="size-8" />
                </div>
                <p className="text-gray-400">
                  Someone wants to connect with you on this chat platform. Accept their invite to start chatting!
                </p>
              </div>
              <Button
                onClick={handleAcceptInvite}
                disabled={loading}
                className="w-full bg-[#6366f1] hover:bg-[#5558e3]"
              >
                {loading ? 'Accepting...' : 'Accept Invite'}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-green-500/20 text-green-500">
                  <Check className="size-8" />
                </div>
                <p className="text-gray-100 text-lg font-semibold mb-2">
                  You're now friends with {inviterName}!
                </p>
                <p className="text-gray-400">
                  You can now start chatting with them.
                </p>
              </div>
              <Button
                onClick={() => navigate('/chat')}
                className="w-full bg-[#6366f1] hover:bg-[#5558e3]"
              >
                Go to Chat
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invite;
