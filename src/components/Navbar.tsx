import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Home, PlusCircle, Compass, LogOut, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Fără semnal
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Pentru tine</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/all-events')}
              className="gap-2"
            >
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Toate</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/create-event')}
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Creare</span>
            </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                  Profilul meu
              </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Ieșire</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
