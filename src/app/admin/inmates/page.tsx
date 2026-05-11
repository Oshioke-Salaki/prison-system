// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Loader2, Trash2, Edit, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function InmatesPage() {
  const [inmates, setInmates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchInmates();
  }, []);

  const fetchInmates = async () => {
      try {
          const { data, error } = await supabase
              .from('inmates')
              .select('*, cells(block_name, cell_number)')
              .order('created_at', { ascending: false });
          
          if (error) throw error;
          if (data) setInmates(data);
      } catch (error) {
          console.error('Error fetching inmates:', error);
      } finally {
          setLoading(false);
      }
  };

  const deleteInmate = async (id: string) => {
      if (!confirm('Are you sure you want to delete this inmate?')) return;
      
      try {
          const { error } = await supabase.from('inmates').delete().eq('id', id);
          if (error) throw error;
          setInmates(inmates.filter(i => i.id !== id));
          setActiveActionId(null);
      } catch (error) {
          alert('Error deleting inmate');
          console.error(error);
      }
  };

  const filteredInmates = inmates.filter(inmate => {
      const matchesSearch = 
          inmate.first_name?.toLowerCase().includes(search.toLowerCase()) || 
          inmate.last_name?.toLowerCase().includes(search.toLowerCase()) || 
          inmate.inmate_number?.includes(search) ||
          inmate.offense?.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || inmate.status === filterStatus;

      return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6" onClick={() => setActiveActionId(null)}>
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Inmate Management</h1>
            <Link href="/admin/inmates/new" className="px-4 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Add Inmate
            </Link>
        </div>

        <div className="flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ID, Name, or Offense" 
                    className="pl-9 pr-4 py-2.5 bg-card border border-white/10 rounded-xl text-sm w-full focus:outline-none focus:border-primary/50 transition-colors" 
                />
             </div>
             <button 
                onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
                className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${showFilters ? 'bg-primary/20 border-primary text-primary' : 'bg-card border-white/10 hover:bg-white/5 text-muted-foreground'}`}
             >
                <Filter className="w-4 h-4" />
                Filters
             </button>
        </div>

        {showFilters && (
            <div className="flex items-center gap-2 p-4 bg-card border border-white/10 rounded-xl animate-in slide-in-from-top-2">
                <span className="text-sm text-muted-foreground mr-2">Status:</span>
                {['all', 'active', 'solitary', 'released'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                            filterStatus === status 
                            ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                            : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>
        )}

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-card/30">
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground uppercase text-xs font-semibold">
                    <tr>
                        <th className="px-6 py-4">Inmate ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Block / Cell</th>
                        <th className="px-6 py-4">Offense</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-card/50">
                    {filteredInmates.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                No inmates found matching your criteria.
                            </td>
                        </tr>
                    ) : (
                        filteredInmates.map((inmate) => (
                            <tr key={inmate.id} className="hover:bg-white/5 transition-colors relative group">
                                <td className="px-6 py-4 font-mono text-muted-foreground">#{inmate.inmate_number}</td>
                                <td className="px-6 py-4 font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {inmate.first_name?.[0]}{inmate.last_name?.[0]}
                                    </div>
                                    <div>
                                        {inmate.first_name} {inmate.last_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {inmate.cells ? (
                                        <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">
                                            {inmate.cells.block_name} - {inmate.cells.cell_number}
                                        </span>
                                    ) : 'Unassigned'}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground capitalize">{inmate.offense || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        inmate.status === 'active' ? 'bg-green-500/20 text-green-500' : 
                                        inmate.status === 'released' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'
                                    }`}>
                                        {inmate.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveActionId(activeActionId === inmate.id ? null : inmate.id);
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${activeActionId === inmate.id ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-muted-foreground'}`}
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>

                                    {activeActionId === inmate.id && (
                                        <div className="absolute right-8 top-0 mt-2 w-32 bg-[#1E1E24] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="py-1">
                                                <Link href={`/admin/inmates/edit/${inmate.id}`} className="w-full px-4 py-2 text-left text-xs font-medium hover:bg-white/5 flex items-center gap-2">
                                                    <Edit className="w-3 h-3" /> Edit
                                                </Link>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteInmate(inmate.id); }}
                                                    className="w-full px-4 py-2 text-left text-xs font-medium hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
            )}
        </div>
    </div>
  );
}
