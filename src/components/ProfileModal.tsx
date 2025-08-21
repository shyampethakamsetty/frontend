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
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'requested'>('pending');
  const [showUserId, setShowUserId] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  // Simulate verification status check (in real app, this would come from Nhost)
  useEffect(() => {
    // For demo purposes, we'll show pending status
    // In production, this would check actual verification status from Nhost
    setVerificationStatus('pending');
  }, []);

  const handleRequestVerification = async () => {
    if (!user) return;
    
    try {
      setVerificationStatus('requested');
      
      // Since Nhost automatically sends verification emails on signup,
      // we'll provide guidance instead of trying to resend
      toast({
        title: 'Verification Email Information 📧',
        description: 'Verification emails are sent automatically when you sign up. If you didn\'t receive it, check your spam folder or contact support for assistance.',
        duration: 8000,
      });
      
      // Show additional help information
      setTimeout(() => {
        toast({
          title: 'Need Help?',
          description: 'You can also try logging out and back in, or contact support if the issue persists.',
          duration: 6000,
        });
      }, 2000);
      
    } catch (error) {
      console.error('Failed to handle verification request:', error);
      
      // Reset status on error
      setVerificationStatus('pending');
      
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again later.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-black border border-gray-800" data-testid="profile-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
            {verificationStatus === 'verified' ? (
              <>
                <i className="fas fa-shield-check text-green-500"></i>
                Email Verified
              </>
            ) : verificationStatus === 'requested' ? (
              <>
                <i className="fas fa-clock text-yellow-500"></i>
                Verification Requested
              </>
            ) : (
              <>
                <i className="fas fa-shield-exclamation text-gray-400"></i>
                Verify Now
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-300">
            {verificationStatus === 'verified' 
              ? 'Your email has been verified. You have full access to all features.'
              : verificationStatus === 'requested'
              ? 'Verification request submitted. Please check your email.'
              : 'Complete your profile verification to unlock all features.'
            }
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
            
            {/* Profile Incomplete Badge */}
            {verificationStatus !== 'verified' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 rounded-full flex items-center justify-center border-2 border-black">
                <i className="fas fa-exclamation text-white text-xs sm:text-sm font-bold"></i>
              </div>
            )}
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

            {/* Email Verification Status */}
            <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
              <div className={`w-5 h-5 flex-shrink-0 ${
                verificationStatus === 'verified' 
                  ? 'text-green-400'
                  : verificationStatus === 'requested'
                  ? 'text-yellow-400'
                  : 'text-gray-400'
              }`}>
                {verificationStatus === 'verified' ? (
                  <i className="fas fa-shield-check"></i>
                ) : verificationStatus === 'requested' ? (
                  <i className="fas fa-clock"></i>
                ) : (
                  <i className="fas fa-shield-exclamation"></i>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs sm:text-sm font-medium text-gray-300">
                  Email Verification
                </label>
                <div className="flex items-center justify-between">
                  <p className={`text-xs sm:text-sm font-semibold ${
                    verificationStatus === 'verified' 
                      ? 'text-green-400'
                      : verificationStatus === 'requested'
                      ? 'text-yellow-400'
                      : 'text-white'
                  }`}>
                    {verificationStatus === 'verified' 
                      ? 'Verified ✓'
                      : verificationStatus === 'requested'
                      ? 'Request Submitted'
                      : 'Verification Required'
                    }
                  </p>
                  <div className="flex items-center space-x-2">
                    {verificationStatus === 'verified' ? (
                      <span className="text-xs text-green-400">
                        <i className="fas fa-check-circle mr-1"></i>
                        Complete
                      </span>
                    ) : verificationStatus === 'requested' ? (
                      <span className="text-xs text-yellow-400">
                        <i className="fas fa-envelope mr-1"></i>
                        Check email
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-gray-400">
                          <i className="fas fa-envelope mr-1"></i>
                          Check inbox
                        </span>
                        <button
                          onClick={handleRequestVerification}
                          className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        >
                          Get Help
                        </button>
                      </>
                    )}
                  </div>
                </div>
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
            {verificationStatus !== 'verified' && (
              <Button
                variant="default"
                onClick={handleRequestVerification}
                disabled={verificationStatus === 'requested'}
                className={`${
                  verificationStatus === 'requested' 
                    ? 'opacity-50 bg-gray-600 text-gray-300' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
                data-testid="profile-verify-button"
              >
                {verificationStatus === 'requested' ? (
                  <>
                    <i className="fas fa-clock mr-2"></i>
                    Requested
                  </>
                ) : (
                  <>
                    <i className="fas fa-question-circle mr-2"></i>
                    Get Help
                  </>
                )}
              </Button>
            )}
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