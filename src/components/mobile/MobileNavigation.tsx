// src/components/mobile/MobileNavigation.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Search,
  Calendar,
  MessageCircle,
  User,
  Bell,
  Settings,
  Heart,
  MapPin,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  ChevronRight,
  Star,
  Bookmark,
  Shield,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Download,
  Share2
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
  isActive?: boolean;
  children?: NavigationItem[];
}

interface MobileNavigationProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    isHost: boolean;
    notifications: number;
  };
  onSignOut?: () => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  user,
  onSignOut,
  className = ''
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const mainNavItems: NavigationItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Home',
      path: '/'
    },
    {
      icon: <Search className="h-5 w-5" />,
      label: 'Search',
      path: '/search'
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Trips',
      path: '/trips',
      badge: 2
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: 'Messages',
      path: '/messages',
      badge: user?.notifications
    },
    {
      icon: <User className="h-5 w-5" />,
      label: 'Profile',
      path: '/profile'
    }
  ];

  const accountItems: NavigationItem[] = [
    {
      icon: <User className="h-5 w-5" />,
      label: 'Personal Info',
      path: '/profile/info'
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Payments & Payouts',
      path: '/profile/payments'
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications',
      path: '/profile/notifications',
      badge: user?.notifications
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: 'Privacy & Sharing',
      path: '/profile/privacy'
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: 'Global Preferences',
      path: '/profile/preferences'
    }
  ];

  const hostItems: NavigationItem[] = user?.isHost ? [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Your Properties',
      path: '/host/properties'
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Reservations',
      path: '/host/reservations'
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: 'Host Messages',
      path: '/host/messages'
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: 'Reviews',
      path: '/host/reviews'
    }
  ] : [];

  const supportItems: NavigationItem[] = [
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: 'Help Center',
      path: '/help'
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: 'Contact Support',
      path: '/support'
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      label: 'Refer Friends',
      path: '/referral'
    }
  ];

  // Check if current path matches navigation item
  const isActiveItem = (path: string) => {
    return location.pathname === path;
  };

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderNavigationSection = (title: string, items: NavigationItem[]) => (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-muted-foreground px-3 py-2">
        {title}
      </h3>
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavigation(item.path)}
          className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
            isActiveItem(item.path)
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            {item.badge && item.badge > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {item.badge > 99 ? '99+' : item.badge}
              </Badge>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
      ))}
    </div>
  );

  // Bottom Navigation for main screens
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {mainNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              isActiveItem(item.path)
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Top Navigation Bar */}
      <div className={`bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden ${className}`}>
        <div className="flex items-center space-x-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-6 pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <SheetTitle className="text-left">
                      {user?.name || 'Guest User'}
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || 'Sign in to access more features'}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-120px)] px-3">
                <div className="space-y-6">
                  {/* Main Navigation */}
                  {renderNavigationSection('Navigate', mainNavItems)}
                  
                  <Separator />

                  {/* Account Settings */}
                  {user && renderNavigationSection('Your Account', accountItems)}
                  
                  {user && <Separator />}

                  {/* Host Section */}
                  {hostItems.length > 0 && (
                    <>
                      {renderNavigationSection('Hosting', hostItems)}
                      <Separator />
                    </>
                  )}

                  {/* Support Section */}
                  {renderNavigationSection('Support', supportItems)}
                  
                  <Separator />

                  {/* App Features */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-muted-foreground px-3 py-2">
                      App Settings
                    </h3>
                    
                    {/* Dark Mode Toggle */}
                    <button
                      onClick={toggleDarkMode}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        <span className="font-medium">
                          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </span>
                      </div>
                    </button>

                    {/* Install App */}
                    {installPrompt && (
                      <button
                        onClick={handleInstallApp}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <Download className="h-5 w-5" />
                          <span className="font-medium">Install App</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      </button>
                    )}

                    {/* Settings */}
                    <button
                      onClick={() => handleNavigation('/settings')}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Settings</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  {user && (
                    <>
                      <Separator />
                      <div className="px-3 pb-4">
                        <button
                          onClick={() => {
                            onSignOut?.();
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-bold text-primary">SaStays</h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <button 
            onClick={() => handleNavigation('/notifications')}
            className="relative p-2 hover:bg-gray-100 rounded-lg"
          >
            <Bell className="h-5 w-5" />
            {user?.notifications && user.notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
              >
                {user.notifications > 9 ? '9+' : user.notifications}
              </Badge>
            )}
          </button>

          {/* Quick Search */}
          <button 
            onClick={() => handleNavigation('/search')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Add padding to prevent content from being hidden behind fixed navigation */}
      <style jsx global>{`
        .mobile-content {
          padding-bottom: 80px; /* Space for bottom navigation */
          padding-top: 60px; /* Space for top navigation */
        }
        
        @media (min-width: 768px) {
          .mobile-content {
            padding-bottom: 0;
            padding-top: 0;
          }
        }
      `}</style>
    </>
  );
};

export default MobileNavigation;