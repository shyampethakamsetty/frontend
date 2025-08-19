import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ConnectPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDisplayName, setShowDisplayName] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setIsLoading(true);

    try {
      // First try to log in
      await login(formData.email, formData.password);
      
      toast({
        title: "Welcome back!",
        description: "Login successful",
      });
    } catch (error: any) {
      // If login fails, show display name field for signup
      if (error.message === 'Invalid credentials' || error.message === 'User not found') {
        setShowDisplayName(true);
        toast({
          title: "New user detected",
          description: "Please enter your display name to create an account",
        });
      } else {
        toast({
          title: "Connection failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.displayName) return;

    setIsLoading(true);

    try {
      await signup(formData.email, formData.password);
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to AI Chat",
      });
    } catch (error: any) {
      toast({
        title: "Account creation failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-black">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 metallic-text" data-testid="text-app-title">
            AI Chat
          </h1>
          <p className="text-gray-400 text-lg">
            {showDisplayName ? 'Create your account' : 'Connect to continue'}
          </p>
        </div>

        <form onSubmit={showDisplayName ? handleCreateAccount : handleConnect} className="space-y-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none input-glow text-white placeholder-gray-500"
              placeholder="Enter your email"
              required
              disabled={isLoading || showDisplayName}
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none input-glow text-white placeholder-gray-500"
              placeholder="Enter your password"
              required
              disabled={isLoading || showDisplayName}
              data-testid="input-password"
            />
          </div>

          {showDisplayName && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="displayName" className="text-sm font-medium text-gray-300">
                Display Name
              </Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none input-glow text-white placeholder-gray-500"
                placeholder="Enter your display name"
                required
                disabled={isLoading}
                data-testid="input-display-name"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password || (showDisplayName && !formData.displayName)}
            className="w-full shiny-button text-white py-3 rounded-lg font-semibold flex items-center justify-center group"
            data-testid="button-connect"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {showDisplayName ? 'Creating Account...' : 'Connecting...'}
              </>
            ) : (
              <>
                <i className={`fas ${showDisplayName ? 'fa-user-plus' : 'fa-sign-in-alt'} mr-2 group-hover:animate-bounce-soft`}></i>
                {showDisplayName ? 'Create Account' : 'Connect'}
              </>
            )}
          </Button>
        </form>

        {showDisplayName && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => {
                setShowDisplayName(false);
                setFormData(prev => ({ ...prev, displayName: '' }));
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm"
              variant="ghost"
              data-testid="button-back-to-login"
            >
              ← Back to login
            </Button>
          </div>
        )}


      </div>
    </div>
  );
}