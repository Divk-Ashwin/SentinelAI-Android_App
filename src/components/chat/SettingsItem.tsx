import { ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  icon?: React.ReactNode;
  label: string;
  subtitle?: string;
  trailing?: string;
  showChevron?: boolean;
  hasSwitch?: boolean;
  switchValue?: boolean;
  switchDisabled?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onClick?: () => void;
  disabled?: boolean;
}

export function SettingsItem({
  icon,
  label,
  subtitle,
  trailing,
  showChevron = false,
  hasSwitch = false,
  switchValue = false,
  switchDisabled = false,
  onSwitchChange,
  onClick,
  disabled = false,
}: SettingsItemProps) {
  return (
    <div
      onClick={!disabled && !hasSwitch ? onClick : undefined}
      className={cn(
        'flex items-center gap-4 px-4 py-3.5 bg-card',
        !disabled && !hasSwitch && onClick && 'cursor-pointer hover:bg-accent/50 active:bg-accent',
        'transition-colors duration-150'
      )}
    >
      {icon && (
        <div className="text-muted-foreground">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium',
          disabled ? 'text-muted-foreground' : 'text-foreground'
        )}>
          {label}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {trailing && (
        <span className="text-sm text-muted-foreground">{trailing}</span>
      )}

      {hasSwitch && (
        <Switch
          checked={switchValue}
          onCheckedChange={onSwitchChange}
          disabled={switchDisabled}
        />
      )}

      {showChevron && (
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      )}
    </div>
  );
}
