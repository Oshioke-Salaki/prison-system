// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Search, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
      fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
      try {
          const { data, error } = await supabase
              .from('incidents')
              .select(`
                  *,
                  inmate:inmates (first_name, last_name, inmate_number)
              `)
              .order('reported_at', { ascending: false });
          
          if (error) throw error;
          if (data) setIncidents(data);
      } catch (error) {
          console.error("Error fetching incidents:", error);
      } finally {
          setLoading(false);
      }
  };

  const updateStatus = async (id: string, newStatus: string) => {
      try {
          const { error } = await supabase.from('incidents').update({ status: newStatus }).eq('id', id);
          if (error) throw error;
          setIncidents(incidents.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
      } catch (error) {
          alert('Failed to update incident status');
          console.error(error);
      }
  };

  const filteredIncidents = incidents.filter(inc => 
      inc.type.toLowerCase().includes(search.toLowerCase()) || 
      inc.inmate?.first_name.toLowerCase().includes(search.toLowerCase()) ||
      inc.inmate?.inmate_number.includes(search)
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold">Incident Reports</h1>
               <p className="text-muted-foreground text-sm">Monitor and resolve facility incidents.</p>
            </div>
        </div>

        <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents or inmates..." 
                className="pl-9 pr-4 py-2.5 bg-card border border-white/10 rounded-xl text-sm w-full focus:outline-none focus:border-primary/50 transition-colors" 
            />
        </div>

        {loading ? (
             <div className="flex justify-center p-12">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
        ) : (
             <div className="grid grid-cols-1 gap-4">
                 {filteredIncidents.length === 0 ? (
                     <div className="p-8 text-center border border-white/5 bg-white/5 rounded-2xl text-muted-foreground">
                         No incidents found.
                     </div>
                 ) : (
                     filteredIncidents.map(inc => (
                         <div key={inc.id} className="p-6 rounded-2xl bg-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/20 transition-all">
                             <div className="flex gap-4">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                     inc.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 
                                     inc.severity === 'major' ? 'bg-orange-500/20 text-orange-500' : 'bg-yellow-500/20 text-yellow-500'
                                 }`}>
                                     <AlertTriangle className="w-6 h-6" />
                                 </div>
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg capitalize">{inc.type}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                                            inc.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 
                                            inc.severity === 'major' ? 'bg-orange-500/20 text-orange-500' : 'bg-yellow-500/20 text-yellow-500'
                                        }`}>{inc.severity}</span>
                                     </div>
                                     <p className="text-sm text-muted-foreground mb-2">
                                         Inmate: <span className="text-white font-medium">{inc.inmate?.first_name} {inc.inmate?.last_name} (#{inc.inmate?.inmate_number})</span> • {new Date(inc.reported_at).toLocaleString()}
                                     </p>
                                     <p className="text-sm bg-white/5 p-3 rounded-lg border border-white/5 max-w-2xl">
                                         {inc.description}
                                     </p>
                                 </div>
                             </div>
                             
                             <div className="shrink-0 flex items-center gap-4">
                                 {inc.status === 'reported' ? (
                                     <button 
                                        onClick={() => updateStatus(inc.id, 'resolved')}
                                        className="px-6 py-2.5 bg-green-500/20 text-green-500 border border-green-500/20 rounded-xl font-bold hover:bg-green-500/30 transition-colors flex items-center gap-2"
                                     >
                                        <CheckCircle className="w-4 h-4" /> Mark Resolved
                                     </button>
                                 ) : (
                                     <div className="flex items-center gap-2 px-4 py-2 bg-white/5 text-muted-foreground rounded-xl font-medium">
                                         <CheckCircle className="w-4 h-4 text-green-500" /> Resolved
                                     </div>
                                 )}
                             </div>
                         </div>
                     ))
                 )}
             </div>
        )}
    </div>
  );
}
