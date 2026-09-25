import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

// Google ko sirf ek baar initialize karne ke liye
let googleInitialized = false;


const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', resolve);
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');

    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;

    script.onload = resolve;
    script.onerror = reject;

    document.body.appendChild(script);
  });
};

const GoogleLoginButton = () => {
  const buttonRef = useRef(null);

  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await loadGoogleScript();

        if (!isMounted || !window.google?.accounts?.id) {
          return;
        }

        // Initialize sirf ek baar
        if (!googleInitialized) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

            callback: async (response) => {
              try {
                await loginWithGoogle(response.credential);
                navigate('/exams');
              } catch (error) {
                console.error('Google login failed:', error);
              }
            },
          });

          googleInitialized = true;
        }

        // Button render karo
        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(
            buttonRef.current,
            {
              theme: 'outline',
              size: 'large',
              width: 320,
            }
          );
        }
      } catch (error) {
        console.error(
          'Failed to load Google Identity Services:',
          error
        );
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      ref={buttonRef}
      className="flex justify-center"
    />
  );
};

export default GoogleLoginButton;