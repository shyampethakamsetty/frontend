import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { nhost } from '@/lib/apollo-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Key, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showUserId, setShowUserId] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-black border border-gray-800" data-testid="profile-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
            <i className="fas fa-user text-blue-500"></i>
            User Profile
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-300">
            Your profile information and account details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Profile Avatar */}
          <div className="flex justify-center relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-800 flex items-center justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              )}
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
              <User className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-xs sm:text-sm font-medium text-gray-300">
                  Display Name
                </label>
                <p className="text-xs sm:text-sm font-semibold truncate text-white" data-testid="profile-display-name">
                  {user.displayName || 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
              <Mail className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-xs sm:text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <p className="text-xs sm:text-sm font-semibold break-all text-white" data-testid="profile-email">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-xs sm:text-sm font-medium text-gray-300">
                  Member Since
                </label>
                <p className="text-xs sm:text-sm font-semibold text-white" data-testid="profile-created-date">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
              <Key className="h-5 w-5 text-orange-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-gray-300">
                  User ID
                </label>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-gray-400 break-all" data-testid="profile-user-id">
                    {showUserId ? user.id : '••••••••••••••••••••••••••••••••'}
                  </p>
                  <button
                    onClick={() => setShowUserId(!showUserId)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title={showUserId ? 'Hide User ID' : 'Show User ID'}
                  >
                    {showUserId ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              data-testid="profile-close-button"
            >
              Close
            </Button>
            <Button
              variant="default"
              disabled
              className="opacity-50 bg-gray-600 text-gray-300"
              data-testid="profile-edit-button"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 