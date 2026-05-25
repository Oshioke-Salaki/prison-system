// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Search, Loader2, Calendar as CalendarIcon, Clock, User, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
      fetchVisits();
  }, []);

  const fetchVisits = async () => {
      try {
          const { data, error } = await supabase
              .from('visits')
              .select(`
                  *,
                  inmate:inmates (first_name, last_name, inmate_number)
              `)
              .order('visit_date', { ascending: false });
          
          if (error) throw error;
          if (data) setVisits(data);
      } catch (error) {
          console.error("Error fetching visits:", error);
      } finally {
          setLoading(false);
      }
  };

  const updateStatus = async (id: string, newStatus: string) => {
      try {
          const { error } = await supabase.from('visits').update({ status: newStatus }).eq('id', id);
          if (error) throw error;
          setVisits(visits.map(v => v.id === id ? { ...v, status: newStatus } : v));
      } catch (error) {
          alert('Failed to update visit status');
          console.error(error);
      }
  };

  const filteredVisits = visits.filter(v => 
      v.visitor_name.toLowerCase().includes(search.toLowerCase()) || 
      v.inmate?.first_name.toLowerCase().includes(search.toLowerCase()) ||
      v.inmate?.inmate_number.includes(search)
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold">Visitation Schedule</h1>
               <p className="text-muted-foreground text-sm">Manage upcoming and past visitations.</p>
            </div>
        </div>

        <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search visitor or inmate..." 
                className="pl-9 pr-4 py-2.5 bg-card border border-white/10 rounded-xl text-sm w-full focus:outline-none focus:border-primary/50 transition-colors" 
            />
        </div>

        {loading ? (
             <div className="flex justify-center p-12">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {filteredVisits.length === 0 ? (
                     <div className="col-span-full p-8 text-center border border-white/5 bg-white/5 rounded-2xl text-muted-foreground">
                         No visits found.
                     </div>
                 ) : (
                     filteredVisits.map(visit => (
                         <div key={visit.id} className="p-6 rounded-2xl bg-card border border-white/10 hover:border-primary/20 transition-all flex flex-col">
                             <div className="flex justify-between items-start mb-4">
                                 <div>
                                     <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                         <User className="w-4 h-4 text-primary" />
                                         {visit.visitor_name}
                                     </h3>
                                     <div className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded inline-block">
                                         Visiting: {visit.inmate?.first_name} {visit.inmate?.last_name} (#{visit.inmate?.inmate_number})
                                     </div>
                                 </div>
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                     visit.status === 'scheduled' ? 'bg-blue-500/20 text-blue-500' :
                                     visit.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                 }`}>
                                     {visit.status}
                                 </span>
                             </div>
                             
                             <div className="space-y-3 flex-1 mb-6">
                                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                     <CalendarIcon className="w-4 h-4" />
                                     {new Date(visit.visit_date).toLocaleDateString()}
                                 </div>
                                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                     <Clock className="w-4 h-4" />
                                     {visit.visit_time}
                                 </div>
                                 {visit.notes && (
                                     <p className="text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                                         {visit.notes}
                                     </p>
                                 )}
                             </div>
                             
                             {visit.status === 'scheduled' && (
                                 <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
                                     <button 
                                        onClick={() => updateStatus(visit.id, 'completed')}
                                        className="flex-1 py-2 bg-green-500/20 text-green-500 border border-green-500/20 rounded-xl font-bold hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                                     >
                                         <Check className="w-4 h-4" /> Complete
                                     </button>
                                     <button 
                                        onClick={() => updateStatus(visit.id, 'cancelled')}
                                        className="flex-1 py-2 bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                                     >
                                         <X className="w-4 h-4" /> Cancel
                                     </button>
                                 </div>
                             )}
                         </div>
                     ))
                 )}
             </div>
        )}
    </div>
  );
}
