import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const [, navigate] = useLocation();
  const { signup, isLoading, isAuthenticated, isInitialized } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  // Redirect to chat page if already authenticated
  useEffect(() => {
    console.log('SignupPage - Auth state:', {
      isAuthenticated,
      isLoading,
      isInitialized,
    });

    if (isInitialized && !isLoading && isAuthenticated) {
      console.log('User already authenticated, redirecting to chat...');
      navigate('/chat');
    }
  }, [isAuthenticated, isLoading, isInitialized, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Signup form submitted for:', formData.email);
    
    try {
      await signup(formData.email, formData.password, formData.displayName);
      console.log('Signup successful, user should be redirected automatically');
      
      // Show success message
      toast({
        title: 'Account Created',
        description: 'Welcome! Your account has been created successfully.',
      });
      
      // The redirect will happen automatically via the useEffect above
      // or via the ProtectedRoute component
    } catch (error) {
      console.error('Signup failed:', error);
      toast({
        title: 'Signup Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirecting message
  if (isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-black">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 metallic-text" data-testid="text-app-title">
            Create Account
          </h1>
          <p className="text-gray-400">Join the premium AI experience</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </Label>
            <Input
              type="text"
              name="displayName"
              required
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none input-glow text-white placeholder-gray-500"
              placeholder="Enter your display name"
              value={formData.displayName}
              onChange={handleChange}
              data-testid="input-display-name"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </Label>
            <Input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none input-glow text-white placeholder-gray-500"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              data-testid="input-email"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </Label>
            <Input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none input-glow text-white placeholder-gray-500"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              data-testid="input-password"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </Label>
            <Input
              type="password"
              name="confirmPassword"
              required
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none input-glow text-white placeholder-gray-500"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              data-testid="input-confirm-password"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full premium-button text-white py-3 rounded-lg font-semibold text-lg"
            data-testid="button-create-account"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-gray-200 hover:text-white font-semibold transition-colors" data-testid="link-signin">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
