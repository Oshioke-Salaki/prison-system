// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Lock, Bell, Moon, Shield, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwords.new !== passwords.confirm) {
          alert("Passwords do not match");
          return;
      }
      
      setUpdatingPassword(true);
      try {
          const { error } = await supabase.auth.updateUser({ password: passwords.new });
          if (error) throw error;
          alert("Password updated successfully");
          setShowPasswordForm(false);
          setPasswords({ new: '', confirm: '' });
      } catch (error: any) {
          alert(error.message);
      } finally {
          setUpdatingPassword(false);
      }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) {
      return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and system preferences.</p>
      </div>

      {/* Profile Section */}
      <MotionDiv 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <User className="w-5 h-5" />
            </div>
            <div>
                <h2 className="font-bold text-lg">My Profile</h2>
                <p className="text-sm text-muted-foreground">Your personal information</p>
            </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                <div className="p-3 bg-white/5 rounded-xl text-sm font-mono border border-white/5 opacity-75 cursor-not-allowed">
                    {user?.email}
                </div>
                <p className="text-xs text-muted-foreground">Email changes are currently disabled.</p>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Role</label>
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium capitalize">{user?.user_metadata?.role || 'Admin'}</span>
                </div>
            </div>
        </div>
      </MotionDiv>

      {/* Security Section */}
      <MotionDiv 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                <Lock className="w-5 h-5" />
            </div>
            <div>
                <h2 className="font-bold text-lg">Security</h2>
                <p className="text-sm text-muted-foreground">Password and authentication</p>
            </div>
        </div>
        <div className="p-8">
            {!showPasswordForm ? (
                <button 
                    onClick={() => setShowPasswordForm(true)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                    Change Password
                </button>
            ) : (
                <form onSubmit={handlePasswordChange} className="max-w-md space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">New Password</label>
                        <input 
                            type="password"
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Confirm Password</label>
                        <input 
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button 
                            type="submit" 
                            disabled={updatingPassword}
                            className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                setShowPasswordForm(false);
                                setPasswords({ new: '', confirm: '' });
                            }}
                            className="px-4 py-2 hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
      </MotionDiv>

      {/* System Preferences */}
      <MotionDiv 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Bell className="w-5 h-5" />
            </div>
            <div>
                <h2 className="font-bold text-lg">Notifications</h2>
                <p className="text-sm text-muted-foreground">Manage alert preferences</p>
            </div>
        </div>
        <div className="p-8 space-y-4">
             <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                     <label className="text-sm font-medium text-white">Email Notifications</label>
                     <p className="text-xs text-muted-foreground">Receive daily summaries via email.</p>
                 </div>
                 <div className="h-6 w-11 bg-primary/20 rounded-full relative cursor-pointer border border-primary/50">
                     <div className="h-4 w-4 bg-primary rounded-full absolute top-1 right-1 shadow-sm"></div>
                 </div>
             </div>
             <div className="flex items-center justify-between opacity-50">
                 <div className="space-y-0.5">
                     <label className="text-sm font-medium text-white">Browser Push</label>
                     <p className="text-xs text-muted-foreground">Get real-time alerts on your desktop.</p>
                 </div>
                 <div className="h-6 w-11 bg-white/10 rounded-full relative cursor-not-allowed border border-white/10">
                     <div className="h-4 w-4 bg-white/50 rounded-full absolute top-1 left-1"></div>
                 </div>
             </div>
        </div>
      </MotionDiv>

    </div>
  );
}
