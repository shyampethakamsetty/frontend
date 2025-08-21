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
import { User, Settings, LogOut, Mail, Calendar, Menu } from 'lucide-react';
import { ProfileModal } from '@/components/ProfileModal';

interface NavbarProps {
  currentChatTitle?: string;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export default function Navbar({ currentChatTitle, onMenuClick, isMobile }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  return (
    <nav className="glass-card border-b border-gray-800 p-4 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2 mr-2 lg:hidden"
              data-testid="mobile-menu-button"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="robot-icon w-8 h-8 flex items-center justify-center">
            <i className="fas fa-robot text-black text-sm"></i>
          </div>
          <div className={isMobile ? "min-w-0 flex-1" : ""}>
            <h1 className={`font-bold metallic-text ${isMobile ? 'text-lg' : 'text-2xl'}`} data-testid="text-navbar-title">
              AI Chat
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={`flex items-center space-x-2 lg:space-x-3 cursor-pointer hover:bg-gray-800/50 rounded-lg px-2 lg:px-3 py-2 transition-colors ${isMobile ? 'min-w-0' : ''}`} data-testid="profile-trigger">
                <div className="user-avatar w-8 h-8 flex items-center justify-center flex-shrink-0 relative">
                  <User className="h-4 w-4 text-black" />
                  
                  {/* Profile Incomplete Badge */}
                  {/* Note: In a real app, this would check actual verification status from Nhost */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-white">
                    <i className="fas fa-exclamation text-white text-xs font-bold"></i>
                  </div>
                </div>
                {!isMobile && (
                  <>
                    <span className="text-sm text-white font-medium hidden sm:block" data-testid="text-user-name">
                      {user?.displayName || user?.email}
                    </span>
                    <i className="fas fa-chevron-down text-gray-400 text-xs hidden sm:block"></i>
                  </>
                )}
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
                  {/* Verification Status */}
                  <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-yellow-700 dark:text-yellow-300">
                      Email verification required
                    </span>
                  </div>
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