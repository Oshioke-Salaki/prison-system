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
              .from('staff')
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
          const { error } = await supabase.from('staff').update({ role: newRole }).eq('id', id);
          if (error) throw error;
          
          setProfiles(profiles.map(p => p.id === id ? { ...p, role: newRole } : p));
          alert('Role updated successfully');
      } catch (error) {
          alert('Error updating role: ' + error.message);
      } finally {
          setSaving(null);
      }
  };

  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ firstName: '', lastName: '', role: 'officer', password: 'Password123!' });
  const [creating, setCreating] = useState(false);

  const filteredProfiles = profiles.filter(profile => {
      const name = `${profile.first_name} ${profile.last_name}`.toLowerCase();
      return name.includes(search.toLowerCase()) || profile.role?.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
      e.preventDefault();
      setCreating(true);

      try {
          const email = `${newStaff.firstName.toLowerCase()}.${newStaff.lastName.toLowerCase()}@sentinell.app`;
          
          // 1. Create Auth User via API route
          const res = await fetch('/api/auth/create-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  email, 
                  password: newStaff.password, 
                  role: newStaff.role, 
                  firstName: newStaff.firstName, 
                  lastName: newStaff.lastName 
              })
          });
          
          const authData = await res.json();
          if (!res.ok) throw new Error(authData.error);

          // 2. Create Staff record
          const { error } = await supabase.from('staff').insert([{
              first_name: newStaff.firstName,
              last_name: newStaff.lastName,
              role: newStaff.role,
              profile_id: authData.user.id
          }]);

          if (error) throw error;

          alert(`Staff created successfully! Email: ${email}, Password: ${newStaff.password}`);
          setShowModal(false);
          setNewStaff({ firstName: '', lastName: '', role: 'officer', password: 'Password123!' });
          fetchProfiles();
      } catch (error: any) {
          alert(`Error creating staff: ${error.message}`);
      } finally {
          setCreating(false);
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Staff & User Management</h1>
                <p className="text-muted-foreground text-sm">Manage user roles and access permissions.</p>
            </div>
            <button 
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
                Add Staff
            </button>
        </div>

        <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff..." 
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
                                No staff found.
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
                                            <div className="font-medium text-white">{profile.first_name} {profile.last_name}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {profile.first_name?.toLowerCase()}.{profile.last_name?.toLowerCase()}@sentinell.app
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

        {/* Add Staff Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-background border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold">Add New Staff</h2>
                    </div>
                    <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase">First Name</label>
                                <input required value={newStaff.firstName} onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})} className="w-full bg-card border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
                                <input required value={newStaff.lastName} onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})} className="w-full bg-card border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Role</label>
                            <select required value={newStaff.role} onChange={(e) => setNewStaff({...newStaff, role: e.target.value})} className="w-full bg-card border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none">
                                <option value="officer">Officer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Default Password</label>
                            <input required value={newStaff.password} onChange={(e) => setNewStaff({...newStaff, password: e.target.value})} className="w-full bg-card border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none" />
                        </div>
                        <div className="flex items-center gap-3 pt-4 mt-2">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-medium">Cancel</button>
                            <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-bold flex items-center justify-center gap-2">
                                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create Staff
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
