import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/chat/Header';
import { SettingsItem } from '@/components/chat/SettingsItem';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { Palette, Shield, Bell, Brain, Database, Info } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { notificationsEnabled, toggleNotifications } = useChat();
  const { toast } = useToast();

  const handleNotificationToggle = (value: boolean) => {
    toggleNotifications();
    toast({
      title: `Notifications ${value ? 'enabled' : 'disabled'}`,
      description: value 
        ? "You'll receive notifications for new messages." 
        : "You won't receive message notifications.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Settings" showBack />

      <main className="py-4">
        {/* Appearance Section */}
        <div className="mb-6">
          <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Appearance
          </h3>
          <SettingsItem
            icon={<Palette className="w-5 h-5" />}
            label="Theme"
            trailing="Glacier (System)"
            disabled
          />
        </div>

        {/* Privacy & Security Section */}
        <div className="mb-6">
          <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Privacy & Security
          </h3>
          <SettingsItem
            icon={<Shield className="w-5 h-5" />}
            label="Privacy & Security"
            showChevron
            onClick={() => {
              toast({
                title: "Coming soon",
                description: "Privacy settings will be available in a future update.",
              });
            }}
          />
        </div>

        {/* Notifications Section */}
        <div className="mb-6">
          <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Notifications
          </h3>
          <SettingsItem
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
            hasSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={handleNotificationToggle}
          />
        </div>

        {/* Security Features Section */}
        <div className="mb-6">
          <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Security Features
          </h3>
          <SettingsItem
            icon={<Brain className="w-5 h-5" />}
            label="Spam Protection"
            subtitle="ML-based detection – Coming Soon"
            hasSwitch
            switchValue={false}
            switchDisabled
          />
        </div>

        {/* Data & Storage Section */}
        <div className="mb-6">
          <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Data & Storage
          </h3>
          <SettingsItem
            icon={<Database className="w-5 h-5" />}
            label="Data & Storage"
            showChevron
            onClick={() => {
              toast({
                title: "Coming soon",
                description: "Storage settings will be available in a future update.",
              });
            }}
          />
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            About
          </h3>
          <SettingsItem
            icon={<Info className="w-5 h-5" />}
            label="About"
            showChevron
            onClick={() => navigate('/about')}
          />
        </div>
      </main>
    </div>
  );
}
