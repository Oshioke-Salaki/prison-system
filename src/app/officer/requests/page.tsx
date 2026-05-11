// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Check, X, Filter, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function OfficerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const supabase = createClient();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
      try {
          const { data, error } = await supabase
              .from('requests')
              .select(`
                  *,
                  inmate:inmates (first_name, last_name, inmate_number)
              `)
              .order('created_at', { ascending: false });
          
          if (error) throw error;
          if (data) setRequests(data);
      } catch (error) {
          console.error('Error fetching requests:', error);
      } finally {
          setLoading(false);
      }
  };

  const updateStatus = async (id: string, newStatus: string) => {
      const { error } = await supabase
          .from('requests')
          .update({ status: newStatus })
          .eq('id', id);

      if (error) {
          alert('Failed to update status');
      } else {
          setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
  };

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Request Processing</h1>
                <p className="text-muted-foreground text-sm">Review and manage inmate requests</p>
            </div>
             <div className="flex gap-2">
                 {['pending', 'approved', 'rejected', 'all'].map(status => (
                     <button 
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                            filter === status 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                        }`}
                     >
                        {status}
                     </button>
                 ))}
            </div>
        </div>

        {loading ? (
             <div className="flex justify-center p-12">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
        ) : (
        <div className="grid grid-cols-1 gap-4">
             {filteredRequests.length === 0 ? (
                 <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
                     No requests found in this category.
                 </div>
             ) : (
                 filteredRequests.map(req => (
                     <div key={req.id} className="p-6 rounded-2xl bg-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/20 transition-all">
                         <div className="flex items-start gap-4">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                 req.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                 req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                 'bg-blue-500/10 text-blue-500' 
                             }`}>
                                 {req.status === 'approved' ? <CheckCircle className="w-5 h-5"/> :
                                  req.status === 'rejected' ? <XCircle className="w-5 h-5"/> :
                                  <Clock className="w-5 h-5"/>}
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg">{req.subject} <span className="text-sm font-normal text-muted-foreground ml-2 capitalize">({req.type})</span></h3>
                                 <p className="text-muted-foreground text-sm mb-2">
                                     Submitted by <span className="text-white font-medium">{req.inmate?.first_name} {req.inmate?.last_name} (#{req.inmate?.inmate_number})</span> • {new Date(req.created_at).toLocaleString()}
                                 </p>
                                 <p className="text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-w-[300px]">
                                     {req.description || "No description provided."}
                                 </p>
                             </div>
                         </div>
                         
                         {req.status === 'pending' && (
                         <div className="flex items-center gap-3 shrink-0">
                             <button 
                                onClick={() => updateStatus(req.id, 'approved')}
                                className="px-6 py-2.5 bg-green-500/20 text-green-500 border border-green-500/20 rounded-xl font-bold hover:bg-green-500/30 transition-colors flex items-center gap-2"
                             >
                                 <Check className="w-4 h-4" /> Approve
                             </button>
                             <button 
                                onClick={() => updateStatus(req.id, 'rejected')}
                                className="px-6 py-2.5 bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/30 transition-colors flex items-center gap-2"
                             >
                                 <X className="w-4 h-4" /> Reject
                             </button>
                         </div>
                         )}
                         {req.status !== 'pending' && (
                             <div className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${
                                 req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                             }`}>
                                 {req.status}
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
