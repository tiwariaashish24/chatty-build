import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Avatar from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  MessageSquare,
  Hash,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Plus,
  Home,
} from 'lucide-react';

const AppShell = ({ children, currentPage }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'chat', label: 'Messages', icon: MessageSquare, path: '/chat' },
    { id: 'rooms', label: 'Rooms', icon: Hash, path: '/rooms' },
    { id: 'friends', label: 'Contacts', icon: Users, path: '/friends' },
    { id: 'dashboard', label: 'Activity', icon: BarChart3, path: '/dashboard' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0B1020]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#172338] border-r border-[rgba(148,163,184,0.16)]">
        {/* Logo */}
        <div className="p-4 border-b border-[rgba(148,163,184,0.16)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4F7CFF] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#F8FAFC]">Chatty</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#4F7CFF] text-white'
                    : 'text-[#94A3B8] hover:bg-[#243247] hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[rgba(148,163,184,0.16)]">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profilePic} alt={user?.fullName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F8FAFC] truncate">{user?.fullName}</p>
              <p className="text-xs text-[#94A3B8] truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#243247]"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#172338] border-b border-[rgba(148,163,184,0.16)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4F7CFF] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#F8FAFC]">Chatty</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-[#94A3B8]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#172338] p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold text-[#F8FAFC]">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#94A3B8]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#4F7CFF] text-white'
                        : 'text-[#94A3B8] hover:bg-[#243247] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#243247]"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
