import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setStatus('denied');
        return;
      }

      // Server-side role verification via edge function
      const { data, error } = await supabase.functions.invoke('check-admin-role', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error || !data?.isAdmin) {
        setStatus('denied');
        return;
      }

      setStatus('authorized');
    } catch {
      setStatus('denied');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Shield className="w-10 h-10 text-ancient-gold animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md px-6">
          <Lock className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You must be an authenticated admin to access this page.
          </p>
          <p className="text-xs text-muted-foreground italic">
            "The LORD is a refuge for the oppressed, a stronghold in times of trouble." — Psalm 9:9
          </p>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
