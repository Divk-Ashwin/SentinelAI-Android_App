import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Step = 'phone' | 'otp';

export default function Login() {
  const { sendOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+91 ');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus phone input
  useEffect(() => {
    if (step === 'phone') phoneInputRef.current?.focus();
  }, [step]);

  // Auto-focus first OTP box
  useEffect(() => {
    if (step === 'otp') otpRefs.current[0]?.focus();
  }, [step]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // Format phone as user types
  const handlePhoneChange = (raw: string) => {
    // Only allow digits, +, and spaces
    let cleaned = raw.replace(/[^\d+\s]/g, '');

    // Ensure starts with +91
    if (!cleaned.startsWith('+91')) {
      cleaned = '+91 ';
    }

    // Format: +91 XXXXX XXXXX
    const digits = cleaned.replace(/\D/g, '').slice(2); // after 91
    let formatted = '+91';
    if (digits.length > 0) formatted += ' ' + digits.slice(0, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 10);

    setPhone(formatted);
    setError('');
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    const result = await sendOTP(phone);
    setLoading(false);

    if (result.success) {
      setStep('otp');
      setResendTimer(30);
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(d => d !== '') && value) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (code: string) => {
    setLoading(true);
    setError('');
    const result = await verifyOTP(phone, code);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Verification failed');
      setOtp(Array(6).fill(''));
      otpRefs.current[0]?.focus();
    }
    // On success, AuthContext updates and app navigates automatically
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    await sendOTP(phone);
    setLoading(false);
    setResendTimer(30);
    setOtp(Array(6).fill(''));
    otpRefs.current[0]?.focus();
  };

  const isPhoneValid = phone.replace(/\D/g, '').length === 12; // 91 + 10 digits

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
          <Shield className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">SentinelAI</h1>
          <p className="text-xs text-muted-foreground">Smart SMS Protection</p>
        </div>
      </div>

      {step === 'phone' ? (
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Welcome</h2>
            <p className="text-sm text-muted-foreground">
              Enter your mobile number to get started
            </p>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Mobile Number
            </label>
            <input
              ref={phoneInputRef}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full h-14 rounded-xl border border-input bg-card text-foreground text-lg font-medium px-4 outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              We'll send you a verification code via SMS
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center font-medium">{error}</p>
          )}

          <Button
            onClick={handleSendOTP}
            disabled={!isPhoneValid || loading}
            className="w-full h-12 text-base font-semibold rounded-xl gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Send OTP
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Verify OTP</h2>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to{' '}
              <span className="font-medium text-foreground">{phone}</span>
            </p>
          </div>

          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(i, e.target.value)}
                onKeyDown={(e) => handleOTPKeyDown(i, e)}
                className={cn(
                  "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-card text-foreground outline-none transition-all",
                  digit ? "border-primary" : "border-input",
                  "focus:border-primary focus:ring-2 focus:ring-ring"
                )}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center font-medium animate-pulse">{error}</p>
          )}

          {loading && (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Resend */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in <span className="font-medium text-foreground">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            )}
          </div>

          {/* Back */}
          <button
            onClick={() => { setStep('phone'); setOtp(Array(6).fill('')); setError(''); }}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            ← Change phone number
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Use code <span className="font-mono font-bold text-foreground">123456</span> for demo
          </p>
        </div>
      )}
    </div>
  );
}
