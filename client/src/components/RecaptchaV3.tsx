import { useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface RecaptchaV3Props {
  siteKey: string;
  action: string;
  onToken: (token: string) => void;
  onError?: (error: string) => void;
}

export default function RecaptchaV3({ siteKey, action, onToken, onError }: RecaptchaV3Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey) return;

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setLoaded(true);
    };

    script.onerror = () => {
      onError?.('Failed to load reCAPTCHA');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script
      const existingScript = document.querySelector(`script[src*="${siteKey}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [siteKey, onError]);

  const executeRecaptcha = async () => {
    if (!loaded || !window.grecaptcha) {
      onError?.('reCAPTCHA not loaded');
      return;
    }

    try {
      await window.grecaptcha.ready();
      const token = await window.grecaptcha.execute(siteKey, { action });
      onToken(token);
    } catch (error) {
      onError?.('reCAPTCHA execution failed');
    }
  };

  useEffect(() => {
    if (loaded) {
      executeRecaptcha();
    }
  }, [loaded, action]);

  return null; // This is an invisible component
}

// Hook for easy reCAPTCHA integration
export function useRecaptcha(siteKey: string) {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const executeRecaptcha = async (action: string): Promise<string> => {
    if (!siteKey) {
      throw new Error('reCAPTCHA site key not configured');
    }

    setLoading(true);
    setError('');

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        setLoading(false);
      };

      const handleToken = (token: string) => {
        setToken(token);
        cleanup();
        resolve(token);
      };

      const handleError = (error: string) => {
        setError(error);
        cleanup();
        reject(new Error(error));
      };

      // Create temporary component
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);

      // This would need to be rendered properly in React context
      // For now, we'll use the direct API approach
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action })
            .then(handleToken)
            .catch(handleError);
        });
      } else {
        handleError('reCAPTCHA not loaded');
      }
    });
  };

  return {
    token,
    error,
    loading,
    executeRecaptcha
  };
}