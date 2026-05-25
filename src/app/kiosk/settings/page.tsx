// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Key, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function KioskSettingsPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
      }
      if (password.length < 6) {
          alert('Password must be at least 6 characters');
          return;
      }

      setLoading(true);
      try {
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;
          alert('Password updated successfully');
          setPassword('');
          setConfirmPassword('');
      } catch (error: any) {
          alert(`Error updating password: ${error.message}`);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div>
           <h1 className="text-2xl font-bold">Kiosk Settings</h1>
           <p className="text-muted-foreground text-sm">Manage your security preferences.</p>
        </div>

        <MotionDiv 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-white/10 rounded-2xl p-8"
        >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Key className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">Change Password</h2>
                    <p className="text-sm text-muted-foreground">Update the PIN or Password used to access this kiosk.</p>
                </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">New Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                        required
                    />
                </div>
                
                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading || !password || !confirmPassword}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Update Password
                    </button>
                </div>
            </form>
        </MotionDiv>
    </div>
  );
}
