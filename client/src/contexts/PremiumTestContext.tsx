import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebaseAuth } from './FirebaseAuthContext';

interface PremiumTestContextType {
  testPremiumMode: boolean;
  setTestPremiumMode: (enabled: boolean) => void;
  isTestingMode: boolean;
  hasTestPremiumToggle: boolean;
  actualPremiumStatus: boolean;
  isLoading: boolean;
  getEffectivePremiumStatus: () => boolean;
  checkStripeSubscription: () => Promise<boolean>;
}

const PremiumTestContext = createContext<PremiumTestContextType | undefined>(undefined);

export const usePremiumTest = () => {
  const context = useContext(PremiumTestContext);
  if (context === undefined) {
    throw new Error('usePremiumTest must be used within a PremiumTestProvider');
  }
  return context;
};

interface PremiumTestProviderProps {
  children: React.ReactNode;
}

export const PremiumTestProvider: React.FC<PremiumTestProviderProps> = ({ children }) => {
  const [testPremiumMode, setTestPremiumMode] = useState(false);
  const [actualPremiumStatus, setActualPremiumStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useFirebaseAuth();
  
  // Enable testing mode in development
  const isTestingMode = import.meta.env.DEV || true; // Always true for now
  
  // Show premium toggle when authenticated and in testing mode
  const hasTestPremiumToggle = isTestingMode;
  
  // Check Stripe subscription status for the authenticated user
  const checkStripeSubscription = async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      setActualPremiumStatus(false);
      return false;
    }

    setIsLoading(true);
    try {
      // Call your backend API to check Stripe subscription
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUID: user.uid,
          email: user.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const hasActiveSubscription = data.hasActiveSubscription || false;
        setActualPremiumStatus(hasActiveSubscription);
        return hasActiveSubscription;
      } else {
        console.error('Failed to check subscription status');
        setActualPremiumStatus(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking Stripe subscription:', error);
      setActualPremiumStatus(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get the effective premium status (actual Stripe status OR test toggle override)
  const getEffectivePremiumStatus = (): boolean => {
    // In testing mode, allow test toggle to override actual status
    if (isTestingMode && testPremiumMode) {
      return true;
    }
    // Otherwise, use actual Stripe subscription status
    return actualPremiumStatus;
  };

  // Check subscription status when user authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      checkStripeSubscription();
    } else {
      setActualPremiumStatus(false);
    }
  }, [isAuthenticated, user]);

  return (
    <PremiumTestContext.Provider
      value={{
        testPremiumMode,
        setTestPremiumMode,
        isTestingMode,
        hasTestPremiumToggle,
        actualPremiumStatus,
        isLoading,
        getEffectivePremiumStatus,
        checkStripeSubscription,
      }}
    >
      {children}
    </PremiumTestContext.Provider>
  );
};
