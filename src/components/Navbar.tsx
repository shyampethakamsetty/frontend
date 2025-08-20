import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Mail, Calendar } from 'lucide-react';
import { ProfileModal } from '@/components/ProfileModal';

interface NavbarProps {
  currentChatTitle?: string;
}

export default function Navbar({ currentChatTitle }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800/50 rounded-lg px-3 py-2 transition-colors" data-testid="profile-trigger">
                <div className="user-avatar w-8 h-8 flex items-center justify-center">
                  <User className="h-4 w-4 text-black" />
                </div>
                <span className="text-sm text-white font-medium" data-testid="text-user-name">
                  {user?.displayName || user?.email}
                </span>
                <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" data-testid="profile-dropdown">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick} data-testid="profile-details">
                <User className="mr-2 h-4 w-4" />
                <span>Profile Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" disabled>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600" onClick={logout} data-testid="dropdown-logout">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </nav>
  );
}