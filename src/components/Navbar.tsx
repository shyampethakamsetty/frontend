import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  currentChatTitle?: string;
}

export default function Navbar({ currentChatTitle }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-card border-b border-gray-800 p-4 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className="robot-icon w-8 h-8 flex items-center justify-center">
            <i className="fas fa-robot text-black text-sm"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold metallic-text" data-testid="text-navbar-title">
              AI Chat
            </h1>
            {currentChatTitle && (
              <p className="text-sm text-gray-400 mt-1" data-testid="text-current-chat">
                {currentChatTitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="user-avatar w-8 h-8 flex items-center justify-center">
              <i className="fas fa-user text-black text-sm"></i>
            </div>
            <span className="text-sm text-white font-medium" data-testid="text-user-email">
              {user?.email}
            </span>
          </div>
          
          <Button
            onClick={logout}
            className="premium-button px-4 py-2 rounded-lg text-white"
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}