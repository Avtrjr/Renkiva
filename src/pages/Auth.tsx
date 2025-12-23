import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Auth = () => {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect authenticated users to main page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, {
          username,
          display_name: displayName || username
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            setError(t('auth.emailAlreadyRegistered'));
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: t('auth.accountCreated'),
            description: t('auth.checkEmail'),
            duration: 5000,
          });
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError(t('auth.invalidCredentials'));
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: t('auth.welcomeBack'),
            description: t('auth.signedInSuccess'),
            duration: 3000,
          });
        }
      }
    } catch (err) {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aurora-mesh bg-[length:400%_400%] animate-aurora flex items-center justify-center p-4 md:p-6">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full animate-pulse-mesh opacity-60"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-secondary rounded-full animate-float opacity-40"></div>
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-primary-glow rounded-full animate-pulse-mesh opacity-50"></div>
      
      {/* Top bar with back button and language switcher */}
      <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 flex justify-between items-center">
        <Badge 
          variant="outline" 
          className="bg-card/80 backdrop-blur-lg border-border/50 text-foreground shadow-clay-inset cursor-pointer hover:bg-card/90 transition-colors text-xs md:text-sm"
          onClick={() => navigate('/')}
        >
          ← {t('auth.backToRenkiva')}
        </Badge>
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-sm md:max-w-md bg-card/80 backdrop-blur-lg border-border/50 shadow-clay-inset mx-4">
        <CardHeader className="text-center px-4 md:px-6">
          <CardTitle className="text-xl md:text-2xl bg-aurora-1 bg-clip-text text-transparent">
            📺 {isSignUp ? t('auth.joinRenkiva') : t('auth.welcomeToRenkiva')}
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            {isSignUp 
              ? t('auth.signUpDescription')
              : t('auth.signInDescription')
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-4 md:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">{t('auth.username')}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t('auth.usernamePlaceholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={isSignUp}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName">{t('auth.displayName')}</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder={t('auth.displayNamePlaceholder')}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full h-11 md:h-12 text-base md:text-lg bg-gradient-neon hover:shadow-glow"
              disabled={loading}
            >
              {loading 
                ? (isSignUp ? t('auth.creatingAccount') : t('auth.signingIn')) 
                : (isSignUp ? `🚀 ${t('auth.createAccount')}` : `🔑 ${t('auth.signIn')}`)
              }
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmail('');
                setPassword('');
                setUsername('');
                setDisplayName('');
              }}
              className="text-sm md:text-base w-full"
            >
              {isSignUp 
                ? `${t('auth.hasAccount')} ${t('auth.signIn')}` 
                : `${t('auth.noAccount')} ${t('auth.signUp')}`
              }
            </Button>
          </div>
          
          {/* Additional Info */}
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs md:text-sm text-center text-muted-foreground">
              🔒 {t('auth.secureAuth')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
