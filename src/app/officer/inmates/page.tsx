// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, Loader2, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function OfficerDashboard() {
  const [inmates, setInmates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  const filteredInmates = inmates.filter(inmate =>
    inmate.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    inmate.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    inmate.inmate_number?.includes(search)
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Inmate Management</h1>
                <p className="text-muted-foreground text-sm">View and manage assigned inmates</p>
            </div>
            
            <div className="flex gap-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search ID or Name" 
                        className="pl-9 pr-4 py-2.5 bg-card border border-white/10 rounded-xl text-sm w-64 focus:outline-none focus:border-blue-500/50" 
                    />
                 </div>
            </div>
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
                        <th className="px-6 py-4">Inmate ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Cell Block</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-card/50">
                    {filteredInmates.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                No inmates found.
                            </td>
                        </tr>
                    ) : (
                        filteredInmates.map((inmate) => (
                            <tr key={inmate.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-muted-foreground">#{inmate.inmate_number}</td>
                                <td className="px-6 py-4 font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        {inmate.first_name} {inmate.last_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {inmate.cells ? (
                                        <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">
                                            {inmate.cells.block_name} - {inmate.cells.cell_number}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                        inmate.status === 'active' ? 'bg-green-500/20 text-green-500' :
                                        inmate.status === 'solitary' ? 'bg-red-500/20 text-red-500' :
                                        'bg-blue-500/20 text-blue-500'
                                    }`}>
                                        {inmate.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/officer/inmates/${inmate.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium px-3 py-1.5 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                                        View Details
                                    </Link>
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
