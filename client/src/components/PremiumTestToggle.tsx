import React from 'react';
import { Button } from './ui/button';
import { Crown, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { usePremiumTest } from '../contexts/PremiumTestContext';

interface PremiumTestToggleProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export default function PremiumTestToggle({ 
  className = '', 
  size = 'sm',
  showLabel = true 
}: PremiumTestToggleProps) {
  const { 
    testPremiumMode, 
    setTestPremiumMode, 
    hasTestPremiumToggle, 
    actualPremiumStatus, 
    isLoading,
    getEffectivePremiumStatus 
  } = usePremiumTest();
  const { colors } = useTheme();

  // Only show the toggle in testing mode
  if (!hasTestPremiumToggle) {
    return null;
  }

  const effectiveStatus = getEffectivePremiumStatus();
  const isOverride = testPremiumMode && !actualPremiumStatus;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Button
        onClick={() => setTestPremiumMode(!testPremiumMode)}
        size={size}
        variant="outline"
        className={`transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-0`}
        style={{
          borderColor: effectiveStatus ? colors.primary : colors.textSecondary + '40',
          backgroundColor: effectiveStatus ? colors.primary + '20' : 'transparent',
          color: effectiveStatus ? colors.primary : colors.textSecondary,
        }}
        title={`Test Premium Override: ${testPremiumMode ? 'ON' : 'OFF'} | Stripe Status: ${actualPremiumStatus ? 'Active' : 'Inactive'}`}
        disabled={isLoading}
      >
        {effectiveStatus ? (
          <Crown className="h-4 w-4" style={{ color: colors.primary }} />
        ) : (
          <User className="h-4 w-4" style={{ color: colors.textSecondary }} />
        )}
        {showLabel && (
          <span className="ml-2 text-xs font-semibold">
            {effectiveStatus ? 'Premium ON' : 'Premium OFF'}
            {isOverride && ' (Test)'}
          </span>
        )}
      </Button>
      
      {/* Show actual Stripe status */}
      <div className="text-xs text-center" style={{ color: colors.textSecondary }}>
        {isLoading ? 'Checking...' : `Stripe: ${actualPremiumStatus ? 'Active' : 'Inactive'}`}
      </div>
    </div>
  );
}
