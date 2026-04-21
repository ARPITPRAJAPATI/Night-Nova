import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { API } from '../config';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('nn_token', token);
      
      // Fetch user profile immediately to sync state
      const fetchProfile = async () => {
        try {
          const res = await fetch(`${API}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            // We don't need to manually set user here if the App/useAuth re-renders
            // and picks it up from localStorage + useEffect
            window.location.href = '/dashboard';
          } else {
            navigate('/auth');
          }
        } catch (err) {
          navigate('/auth');
        }
      };
      fetchProfile();
    } else {
      navigate('/auth');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50 animate-pulse">
        Synchronizing Identity...
      </h2>
    </div>
  );
}
