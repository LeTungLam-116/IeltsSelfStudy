import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

type Intent = {
  type: string;
  path?: string;
  payload?: any;
};

export function useAuthGuard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const isMobile = useCallback(() => {
    return window.innerWidth < 768; // md breakpoint
  }, []);

  const ensureAuth = useCallback((intent: Intent) => {
    if (isAuthenticated) {
      // Execute the intent immediately if authenticated
      if (intent.type === 'page' && intent.path) {
        navigate(intent.path);
      } else if (intent.type === 'action' && intent.payload) {
        // For action intents, we'd call the action here
        // For now, just navigate to the path if provided
        if (intent.path) navigate(intent.path);
      }
      return true;
    }

    // Save intent for post-login resume
    sessionStorage.setItem('postLoginIntent', JSON.stringify(intent));

    // Use modal on desktop, redirect on mobile
    if (isMobile()) {
      navigate('/login');
    } else {
      // For desktop, we would trigger a login modal here
      // For now, still redirect to login page, but this could be enhanced to show modal
      navigate('/login');
    }

    return false;
  }, [isAuthenticated, navigate, isMobile]);

  return { ensureAuth, isMobile };
}


