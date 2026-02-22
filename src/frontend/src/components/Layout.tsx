import { Link, useNavigate } from '@tanstack/react-router';
import { Home, Search, PlusSquare, MessageCircle, User, Heart } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const currentUserId = identity?.getPrincipal().toString() || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/feed" className="flex items-center">
              <img src="/assets/generated/app-logo.dim_150x50.png" alt="Logo" className="h-8" />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/feed" className="text-foreground/80 hover:text-foreground transition-colors">
                <Home className="h-6 w-6" />
              </Link>
              <Link to="/explore" className="text-foreground/80 hover:text-foreground transition-colors">
                <Search className="h-6 w-6" />
              </Link>
              <Link to="/upload" className="text-foreground/80 hover:text-foreground transition-colors">
                <PlusSquare className="h-6 w-6" />
              </Link>
              <Link to="/messages" className="text-foreground/80 hover:text-foreground transition-colors">
                <MessageCircle className="h-6 w-6" />
              </Link>
              <Link to={`/profile/${currentUserId}`} className="text-foreground/80 hover:text-foreground transition-colors">
                <User className="h-6 w-6" />
              </Link>
            </nav>

            <Button variant="ghost" onClick={handleLogout} size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
        <div className="flex items-center justify-around h-16">
          <Link to="/feed" className="text-foreground/80 hover:text-foreground transition-colors">
            <Home className="h-6 w-6" />
          </Link>
          <Link to="/explore" className="text-foreground/80 hover:text-foreground transition-colors">
            <Search className="h-6 w-6" />
          </Link>
          <Link to="/upload" className="text-foreground/80 hover:text-foreground transition-colors">
            <PlusSquare className="h-6 w-6" />
          </Link>
          <Link to="/messages" className="text-foreground/80 hover:text-foreground transition-colors">
            <MessageCircle className="h-6 w-6" />
          </Link>
          <Link to={`/profile/${currentUserId}`} className="text-foreground/80 hover:text-foreground transition-colors">
            <User className="h-6 w-6" />
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 mb-16 md:mb-0">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
