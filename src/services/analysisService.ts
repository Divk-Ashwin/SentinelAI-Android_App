/**
 * Analysis Service - Scam detection and SMS analysis
 *
 * In production, this would call a backend (Supabase Edge Function
 * or external API like Gemini) for AI-based analysis.
 * For now, it uses rule-based heuristics.
 */

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ThreatIndicator {
  id: string;
  label: string;
  detected: boolean;
  icon: string;
  details: string;
}

export interface AnalysisResult {
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  threats: ThreatIndicator[];
  verdict: string;
  recommendations: {
    dos: string[];
    donts: string[];
  };
}

const SCAM_PATTERNS = [
  { regex: /\b(congratulations|congrats)\b/i, label: 'Urgency/Excitement Tactics', icon: '⚠️' },
  { regex: /\b(click|tap)\s+(here|now|this|the)\b/i, label: 'Suspicious Call-to-Action', icon: '🔗' },
  { regex: /\b(bit\.ly|tinyurl|short\.link|goo\.gl)\b/i, label: 'Shortened URL Found', icon: '🔗' },
  { regex: /\b(free|won|winner|prize|reward|lottery)\b/i, label: 'Prize/Reward Scam Pattern', icon: '🎁' },
  { regex: /\b(urgent|immediately|act now|expires|limited)\b/i, label: 'Urgency Tactics Detected', icon: '⏰' },
  { regex: /\b(otp|password|pin|cvv|ssn|aadhaar|pan)\b/i, label: 'Requests Sensitive Info', icon: '🔐' },
  { regex: /\b(bank|account|transfer|upi|paytm|gpay)\b/i, label: 'Financial Context Detected', icon: '💰' },
  { regex: /\b(verify|confirm|update|suspend)\s+(your|account)\b/i, label: 'Phishing Language', icon: '🎣' },
];

/**
 * Analyze a single message for scam indicators.
 */
export function analyzeMessage(messageBody: string, senderAddress?: string): AnalysisResult {
  const threats: ThreatIndicator[] = SCAM_PATTERNS.map((pattern, i) => ({
    id: `threat_${i}`,
    label: pattern.label,
    detected: pattern.regex.test(messageBody),
    icon: pattern.icon,
    details: pattern.regex.test(messageBody)
      ? `Pattern matched: "${messageBody.match(pattern.regex)?.[0]}"`
      : 'Not detected',
  }));

  // Add unknown sender as a threat if no contact name
  if (senderAddress && !senderAddress.includes(' ')) {
    threats.push({
      id: 'threat_unknown',
      label: 'Unknown Sender',
      detected: true,
      icon: '👤',
      details: `Sender ${senderAddress} is not in your contacts`,
    });
  }

  const detectedCount = threats.filter(t => t.detected).length;
  const riskScore = Math.min(100, Math.round((detectedCount / threats.length) * 100 * 1.5));

  const riskLevel: RiskLevel =
    riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW';

  const verdicts: Record<RiskLevel, string> = {
    HIGH: 'This message is likely a scam attempt. Do not interact with it.',
    MEDIUM: 'This message contains some suspicious elements. Proceed with caution.',
    LOW: 'This message appears to be safe. No major threats detected.',
  };

  return {
    riskScore,
    riskLevel,
    threats,
    verdict: verdicts[riskLevel],
    recommendations: {
      dos: [
        '🗑️ Delete this message',
        '🚫 Block this number',
        '⚠️ Warn family and friends about this scam',
      ],
      donts: [
        '❌ Do not click any links',
        '❌ Do not share OTP, password, or personal info',
        '❌ Do not send money or make payments',
      ],
    },
  };
}
