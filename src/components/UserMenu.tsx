import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Upload, User as UserIcon, Settings, Video, Cog, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserMenuProps {
  user: User;
}

const UserMenu = ({ user }: UserMenuProps) => {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator']);
      
      if (!error && data && data.length > 0) {
        setIsAdmin(true);
      }
    };

    checkAdminRole();
  }, [user.id]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: t('common.error'),
        description: t('userMenu.signOutError'),
        variant: "destructive",
      });
    } else {
      toast({
        title: t('userMenu.signedOut'),
        description: t('userMenu.signedOutDesc'),
      });
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.email || '')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.display_name || user.user_metadata?.username || t('userMenu.user')}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center">
            <Settings className="me-2 h-4 w-4" />
            <span>{t('nav.dashboard')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <UserIcon className="me-2 h-4 w-4" />
          <span>{t('nav.profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Upload className="me-2 h-4 w-4" />
          <span>{t('nav.uploadContent')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/library" className="flex items-center">
            <Video className="me-2 h-4 w-4" />
            <span>{t('nav.contentLibrary')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/mesh-library" className="flex items-center">
            <Video className="me-2 h-4 w-4" />
            <span>{t('nav.publicDomainLibrary')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Cog className="me-2 h-4 w-4" />
            <span>{t('nav.settings')}</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center text-primary">
                <Shield className="me-2 h-4 w-4" />
                <span>{t('nav.adminDashboard', 'Admin Dashboard')}</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="me-2 h-4 w-4" />
          <span>{t('nav.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
