import { useEffect, useState } from 'react';
import { LogIn, LogOut, User, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProfileButton = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [planId, setPlanId] = useState<number>(1); // Default to free plan
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
      if (user?.email) {
        setInitials(user.email.substring(0, 2).toUpperCase());
      }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          setPlanId(profile.plan_id);
        }
      }
    };
    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed in ProfileButton:', event);
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        if (session.user.user_metadata?.avatar_url) {
          setAvatarUrl(session.user.user_metadata.avatar_url);
        }
        if (session.user.email) {
          setInitials(session.user.email.substring(0, 2).toUpperCase());
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_id')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setPlanId(profile.plan_id);
        }
      } else {
        setAvatarUrl(null);
        setInitials('');
        setPlanId(1);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  const handleSignOut = async () => {
    console.log('Signing out...');
    try {
      await supabase.auth.signOut();
      console.log('Sign out successful');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={avatarUrl || ''} />
            <AvatarFallback className="bg-muted">
              {isAuthenticated ? initials : <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isAuthenticated ? (
          <>
            <DropdownMenuLabel className="flex items-center">
              {t('plans.currentPlan')} {planId === 2 ? (
                <span className="flex items-center ml-1">
                  Pro <Crown className="h-4 w-4 ml-1 text-primary" />
                </span>
              ) : (
                'Free'
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/plans')}>
              {t('plans.changePlan')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('auth.signOut')}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={handleSignIn}>
            <LogIn className="mr-2 h-4 w-4" />
            {t('auth.signIn')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileButton;