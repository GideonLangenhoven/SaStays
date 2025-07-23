import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu, User, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AppContextDemo';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <Button variant="ghost" size="sm" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary">SaStays</h1>
            <Badge variant="secondary" className="text-xs">Owner Portal</Badge>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative">
            <MessageSquare className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
              5
            </Badge>
          </Button>

          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2 border-l pl-3">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="text-sm">{user?.name || 'Owner'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;