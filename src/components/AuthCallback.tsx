import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error during auth callback:', error);
        navigate('/profile?error=Unable to confirm email');
      } else {
        navigate('/profile?success=Email confirmed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <div>Processing authentication, please wait...</div>;
};

export default AuthCallback;