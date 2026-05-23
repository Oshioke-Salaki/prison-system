// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MotionDiv = motion.div as any;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Fetch user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('staff')
        .select('role')
        .eq('profile_id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
          // If profile doesn't exist, assume inmate or handle error
          console.error("Profile error", profileError);
      }

      const role = profile?.role || 'inmate';

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'officer') {
        router.push('/officer');
      } else {
        router.push('/kiosk');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
        </div>

      <MotionDiv 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Secure access to the Sentinell System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-10 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-10 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <MotionDiv 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium"
              >
                {error}
              </MotionDiv>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account? <span className="text-primary cursor-pointer hover:underline">Contact Administrator</span>
            </p>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
