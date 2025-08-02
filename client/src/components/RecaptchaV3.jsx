import { createContext, useContext, useEffect, useState } from 'react';
const RecaptchaV3Context = createContext(null);
export function RecaptchaV3Provider({ children, siteKey }) {
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        const loadRecaptcha = async () => {
            if (window.grecaptcha) {
                setIsLoaded(true);
                return;
            }
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                window.grecaptcha.ready(() => {
                    setIsLoaded(true);
                });
            };
            document.head.appendChild(script);
        };
        loadRecaptcha();
    }, [siteKey]);
    const executeRecaptcha = async (action) => {
        if (!window.grecaptcha || !isLoaded) {
            throw new Error('reCAPTCHA not loaded');
        }
        return new Promise((resolve, reject) => {
            window.grecaptcha.ready(() => {
                window.grecaptcha.execute(siteKey, { action })
                    .then(resolve)
                    .catch(reject);
            });
        });
    };
    return (<RecaptchaV3Context.Provider value={{ executeRecaptcha, isLoaded }}>
      {children}
    </RecaptchaV3Context.Provider>);
}
export function useRecaptcha() {
    const context = useContext(RecaptchaV3Context);
    if (!context) {
        throw new Error('useRecaptcha must be used within a RecaptchaV3Provider');
    }
    return context;
}
