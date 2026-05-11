// @ts-nocheck
'use client';

import React from 'react';
import { Plus, ShoppingCart, Clock } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function KioskDashboard() {
  const [recentRequests, setRecentRequests] = React.useState<any[]>([]);
  const supabase = createClient();

  React.useEffect(() => {
    const fetchRecent = async () => {
        // 1. Try to get logged in user
        const { data: { user } } = await supabase.auth.getUser();
        let inmateId;

        if (user) {
            const { data: inmate } = await supabase.from('inmates').select('id').eq('profile_id', user.id).single();
            inmateId = inmate?.id;
        }

        // 2. Demo Mode Fallback
        if (!inmateId) {
            const { data: demoInmate } = await supabase.from('inmates').select('id').limit(1).single();
            if (demoInmate) inmateId = demoInmate.id;
        }

        if (inmateId) {
            const { data } = await supabase
                .from('requests')
                .select('*')
                .eq('inmate_id', inmateId)
                .order('created_at', { ascending: false })
                .limit(2);
            
            if (data) setRecentRequests(data);
        }
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-8 pb-20">
       <div className="p-6 rounded-3xl bg-gradient-to-r from-primary to-purple-600 text-white shadow-2xl shadow-primary/20">
            <h1 className="text-sm font-medium opacity-80 mb-1">Good Morning</h1>
            <h2 className="text-3xl font-bold">What do you need today?</h2>
       </div>

       <div className="grid grid-cols-2 gap-4">
            <Link href="/kiosk/requests" className="p-6 rounded-2xl bg-card border border-white/10 hover:border-primary/50 transition-all flex flex-col items-center gap-4 text-center group">
                 <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8 text-blue-400" />
                 </div>
                 <span className="font-semibold">New Request</span>
            </Link>
            <Link href="/kiosk/store" className="p-6 rounded-2xl bg-card border border-white/10 hover:border-primary/50 transition-all flex flex-col items-center gap-4 text-center group">
                 <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-8 h-8 text-green-400" />
                 </div>
                 <span className="font-semibold">Buy Items</span>
            </Link>
       </div>

       <div className="rounded-2xl bg-card/50 border border-white/5 p-6">
           <h3 className="font-semibold mb-4 flex items-center gap-2">
               <Clock className="w-4 h-4 text-muted-foreground" />
               Recent Requests
           </h3>
           <div className="space-y-3">
                {recentRequests.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">No recent requests</div>
                ) : (
                    recentRequests.map(req => (
                        <div key={req.id} className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
                            <div>
                                <div className="font-medium capitalize">{req.subject}</div>
                                <div className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</div>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                                req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                req.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                                {req.status}
                            </span>
                        </div>
                    ))
                )}
           </div>
       </div>
    </div>
  );
}
