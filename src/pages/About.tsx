import { Header } from '@/components/chat/Header';
import { Shield, Lock, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function About() {
  const { toast } = useToast();

  const handleLinkClick = (linkName: string) => {
    toast({
      title: "Coming soon",
      description: `${linkName} will be available soon.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="About" showBack />

      <main className="px-6 py-8">
        {/* App Logo and Name */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SecureChat</h1>
          <p className="text-muted-foreground mt-1">Version 1.0.0 (Beta)</p>
        </div>

        {/* Description */}
        <div className="bg-card rounded-xl p-5 border border-border mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-foreground mb-2">Security-First Messaging</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SecureChat is a privacy-focused messaging application designed with security at its core. 
                Our ML-powered spam detection helps protect you from unwanted messages, while end-to-end 
                encryption ensures your conversations remain private.
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-1 mb-8">
          <button
            onClick={() => handleLinkClick('Terms of Service')}
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors"
          >
            <span className="text-foreground">Terms of Service</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => handleLinkClick('Privacy Policy')}
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors"
          >
            <span className="text-foreground">Privacy Policy</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => handleLinkClick('Open Source Licenses')}
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors"
          >
            <span className="text-foreground">Open Source Licenses</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2026 SecureChat. All rights reserved.</p>
          <p className="mt-1">Made with security in mind.</p>
        </div>
      </main>
    </div>
  );
}
