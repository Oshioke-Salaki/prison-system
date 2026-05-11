// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Search, Shield, UserCog, Mail, Loader2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function StaffPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
      try {
          const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .order('created_at', { ascending: false });
          
          if (error) throw error;
          if (data) setProfiles(data);
      } catch (error) {
          console.error('Error fetching profiles:', error);
      } finally {
          setLoading(false);
      }
  };

  const updateRole = async (id: string, newRole: string) => {
      setSaving(id);
      try {
          const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
          if (error) throw error;
          
          setProfiles(profiles.map(p => p.id === id ? { ...p, role: newRole } : p));
          alert('Role updated successfully');
      } catch (error) {
          alert('Error updating role: ' + error.message);
      } finally {
          setSaving(null);
      }
  };

  const filteredProfiles = profiles.filter(profile => 
      profile.email?.toLowerCase().includes(search.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      profile.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Staff & User Management</h1>
            <p className="text-muted-foreground text-sm">Manage user roles and access permissions.</p>
        </div>

        <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..." 
                className="pl-9 pr-4 py-2.5 bg-card border border-white/10 rounded-xl text-sm w-full focus:outline-none focus:border-primary/50 transition-colors" 
            />
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-card/30">
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
            <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground uppercase text-xs font-semibold">
                    <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-card/50">
                    {filteredProfiles.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                No users found.
                            </td>
                        </tr>
                    ) : (
                        filteredProfiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <UserCog className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{profile.full_name || 'Unknown Name'}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {profile.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                        profile.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                        profile.role === 'officer' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-white/10 text-muted-foreground'
                                    }`}>
                                        {profile.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(profile.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <select 
                                        value={profile.role}
                                        onChange={(e) => updateRole(profile.id, e.target.value)}
                                        disabled={saving === profile.id}
                                        className="bg-[#1E1E24] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="inmate">Inmate</option>
                                        <option value="officer">Officer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {saving === profile.id && <Loader2 className="w-3 h-3 animate-spin inline ml-2" />}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            )}
        </div>
    </div>
  );
}
