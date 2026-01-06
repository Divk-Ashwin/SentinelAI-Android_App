import { useState, useEffect } from 'react';
import { X, Shield, AlertTriangle, Brain, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string;
}

type RiskLevel = 'low' | 'medium' | 'high';

interface AnalysisResult {
  riskLevel: RiskLevel;
  riskScore: number;
  flags: string[];
}

export function AnalyzeModal({ isOpen, onClose, messageText }: AnalyzeModalProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnalyzing(true);
      // Simulate analysis
      setTimeout(() => {
        const random = Math.random();
        let riskLevel: RiskLevel;
        let riskScore: number;
        
        if (random < 0.6) {
          riskLevel = 'low';
          riskScore = Math.floor(Math.random() * 30) + 5;
        } else if (random < 0.9) {
          riskLevel = 'medium';
          riskScore = Math.floor(Math.random() * 30) + 35;
        } else {
          riskLevel = 'high';
          riskScore = Math.floor(Math.random() * 30) + 70;
        }

        const possibleFlags = ['Potential Spam', 'Suspicious Link', 'Unusual Pattern'];
        const flags = riskLevel === 'low' 
          ? [] 
          : possibleFlags.slice(0, Math.floor(Math.random() * 2) + 1);

        setAnalysis({ riskLevel, riskScore, flags });
        setIsAnalyzing(false);
      }, 1200);
    } else {
      setAnalysis(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const riskColors = {
    low: 'text-chart-1 bg-chart-1/10',
    medium: 'text-chart-4 bg-chart-4/10',
    high: 'text-destructive bg-destructive/10',
  };

  const riskLabels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto shadow-xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Message Analysis</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="mt-4 text-muted-foreground">Analyzing message...</p>
            </div>
          ) : analysis && (
            <>
              {/* Risk Score */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Risk Assessment
                </label>
                <div className={cn(
                  'flex items-center gap-3 p-4 rounded-xl',
                  riskColors[analysis.riskLevel]
                )}>
                  <Shield className="w-8 h-8" />
                  <div>
                    <p className="font-semibold text-lg">
                      {riskLabels[analysis.riskLevel]}
                    </p>
                    <p className="text-sm opacity-80">
                      Score: {analysis.riskScore}/100
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      analysis.riskLevel === 'low' && 'bg-chart-1',
                      analysis.riskLevel === 'medium' && 'bg-chart-4',
                      analysis.riskLevel === 'high' && 'bg-destructive'
                    )}
                    style={{ width: `${analysis.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Detection Flags */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Detection Flags
                </label>
                {analysis.flags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.flags.map((flag, index) => (
                      <span
                        key={index}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                          flag === 'Potential Spam' && 'bg-chart-4/10 text-chart-4',
                          flag === 'Suspicious Link' && 'bg-destructive/10 text-destructive',
                          flag === 'Unusual Pattern' && 'bg-chart-1/10 text-chart-5'
                        )}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {flag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-chart-1">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">No threats detected</span>
                  </div>
                )}
              </div>

              {/* Analysis Details */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Analysis Details
                </label>
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    ML-powered deep analysis coming soon
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Advanced pattern recognition and threat detection will be available in future updates
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
