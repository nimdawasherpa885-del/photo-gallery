import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.ts';
import { User, UserRole } from '../types.ts';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, avatar, created_at')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: '',
      createdAt: data.created_at,
    };
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { success: false, error: error.message };

    const profile = data.user ? await fetchProfile(data.user.id) : null;
    if (!profile) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Your account profile could not be found. Make sure the Supabase migration is installed and your profile exists.',
      };
    }

    setSession(data.session);
    setUser(profile);
    return { success: true, role: profile.role };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) return { success: false, error: 'Please enter your full name.' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Signup failed. Please try again.' };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
