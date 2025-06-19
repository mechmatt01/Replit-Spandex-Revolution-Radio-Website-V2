import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  
  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        await register(email, password, firstName, lastName);
        toast({
          title: "Account created!",
          description: "Welcome to Spandex Salvation Radio.",
        });
      }
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: mode === 'login' ? "Login failed" : "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 border-orange-500/20 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {mode === 'login' ? (
              <>
                <LogIn className="h-5 w-5 text-orange-500" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-orange-500" />
                Create Account
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10 bg-black/50 border-gray-700 text-white focus:border-orange-500 focus:ring-0 focus:ring-offset-0"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10 bg-black/50 border-gray-700 text-white focus:border-orange-500 focus:ring-0 focus:ring-offset-0"
                    required
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-black/50 border-gray-700 text-white focus:border-orange-500 focus:ring-0 focus:ring-offset-0"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-black/50 border-gray-700 text-white focus:border-orange-500 focus:ring-0 focus:ring-offset-0"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">Or continue with</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleAuth}
            className="w-full border-gray-700 bg-transparent text-white hover:bg-gray-800"
            disabled={loading}
          >
            <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
            {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-orange-500 hover:text-orange-400 text-sm"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}