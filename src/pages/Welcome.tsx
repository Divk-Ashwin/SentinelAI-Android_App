import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, MessageSquare, Zap, Globe, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WelcomeStep = 'welcome' | 'permissions' | 'language';

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
];

export default function Welcome() {
  const { completeSetup } = useAuth();
  const [step, setStep] = useState<WelcomeStep>('welcome');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const handleGrantPermissions = () => {
    // In Capacitor, this would trigger native permission requests
    // For web, we simulate success
    setPermissionsGranted(true);
    setTimeout(() => setStep('language'), 500);
  };

  const handleComplete = () => {
    completeSetup(selectedLanguage);
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to SentinelAI</h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          Your intelligent SMS companion that protects you from scams and keeps your messages organized.
        </p>

        <div className="w-full max-w-xs space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Scam Detection</p>
              <p className="text-xs text-muted-foreground">AI-powered analysis flags suspicious messages</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Smart Inbox</p>
              <p className="text-xs text-muted-foreground">Organized conversations with risk indicators</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Real-time Protection</p>
              <p className="text-xs text-muted-foreground">Instant alerts for incoming scam messages</p>
            </div>
          </div>
        </div>

        <Button onClick={() => setStep('permissions')} className="w-full max-w-xs h-12 text-base rounded-xl gap-2">
          Get Started <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  if (step === 'permissions') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <h2 className="text-xl font-bold text-foreground mb-2">SMS Access Required</h2>
        <p className="text-muted-foreground text-center mb-8 text-sm max-w-xs">
          SentinelAI needs access to your messages to protect you
        </p>

        <div className="w-full max-w-xs space-y-3 mb-8">
          {[
            { icon: '📨', title: 'Read Messages', desc: 'To analyze your messages for scams' },
            { icon: '📤', title: 'Send Messages', desc: 'To let you reply directly from the app' },
            { icon: '👥', title: 'Read Contacts', desc: 'To show contact names instead of numbers' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
              <span className="text-2xl">{icon}</span>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              {permissionsGranted && <Check className="w-5 h-5 text-primary" />}
            </div>
          ))}
        </div>

        <div className="w-full max-w-xs space-y-3">
          <Button
            onClick={handleGrantPermissions}
            disabled={permissionsGranted}
            className="w-full h-12 text-base rounded-xl"
          >
            {permissionsGranted ? 'Permissions Granted ✓' : 'Grant Permissions'}
          </Button>
          <button
            onClick={() => setStep('language')}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-2"
          >
            Maybe Later
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4 max-w-xs">
          On Android, you'll see a system dialog asking for SMS permissions. These are needed for the app to function as your default SMS app.
        </p>
      </div>
    );
  }

  // Language selection
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Globe className="w-12 h-12 text-primary mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Choose Language</h2>
      <p className="text-muted-foreground text-center mb-8 text-sm">
        Select your preferred language for analysis results
      </p>

      <div className="w-full max-w-xs space-y-3 mb-8">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => setSelectedLanguage(lang.code)}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
              selectedLanguage === lang.code
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-muted"
            )}
          >
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">{lang.label}</p>
              <p className="text-sm text-muted-foreground">{lang.native}</p>
            </div>
            {selectedLanguage === lang.code && (
              <Check className="w-5 h-5 text-primary" />
            )}
          </button>
        ))}
      </div>

      <Button onClick={handleComplete} className="w-full max-w-xs h-12 text-base rounded-xl gap-2">
        Continue <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
