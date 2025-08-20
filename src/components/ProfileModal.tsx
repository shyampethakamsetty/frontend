import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Key } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();

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
      <DialogContent className="sm:max-w-[425px]" data-testid="profile-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Details
          </DialogTitle>
          <DialogDescription>
            View your account information and settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profile Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <User className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Display Name
                </label>
                <p className="text-sm font-semibold" data-testid="profile-display-name">
                  {user.displayName || 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Mail className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email Address
                </label>
                <p className="text-sm font-semibold break-all" data-testid="profile-email">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Member Since
                </label>
                <p className="text-sm font-semibold" data-testid="profile-created-date">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Key className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  User ID
                </label>
                <p className="text-xs font-mono text-gray-500 break-all" data-testid="profile-user-id">
                  {user.id}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="profile-close-button"
            >
              Close
            </Button>
            <Button
              variant="default"
              disabled
              className="opacity-50"
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