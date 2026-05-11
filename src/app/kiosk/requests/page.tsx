// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // 1. Try to get logged in user
        const { data: { user } } = await supabase.auth.getUser();
        
        let inmateId;

        if (user) {
            const { data: inmate } = await supabase.from('inmates').select('id').eq('profile_id', user.id).single();
            inmateId = inmate?.id;
        }

        // 2. Fallback: If no auth user or linked inmate (e.g. using Seed Data), use the latest inmate (Demo Mode)
        if (!inmateId) {
            const { data: demoInmate } = await supabase.from('inmates').select('id').limit(1).single();
            if (demoInmate) {
                inmateId = demoInmate.id;
                console.log("Demo Mode: Using inmate ID", inmateId);
            }
        }

        if (inmateId) {
            const { data, error } = await supabase
                .from('requests')
                .select('*')
                .eq('inmate_id', inmateId)
                .order('created_at', { ascending: false });
            
            if (data) setRequests(data);
            if (error) console.error(error);
        }

      } catch (error) {
          console.error("Error fetching requests:", error);
      } finally {
          setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/20';
      default: return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold">My Requests</h1>
           <p className="text-muted-foreground">Track status of your submissions</p>
        </div>
        <Link href="/kiosk/requests/new" className="px-5 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
           <Plus className="w-5 h-5" />
           New Request
        </Link>
      </div>

      <div className="space-y-4">
        {requests.map((req, i) => {
           const StatusIcon = getStatusIcon(req.status);
           return (
            <MotionDiv
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-card border border-white/10 hover:border-primary/30 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                 <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", getStatusColor(req.status))}>
                    <StatusIcon className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="font-semibold text-lg">{req.subject}</div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="capitalize">{req.type}</span>
                        <span>•</span>
                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <span className={cn("px-4 py-1.5 rounded-full text-sm font-bold capitalize", getStatusColor(req.status).split(" ")[0] + " " + getStatusColor(req.status).split(" ")[1])}>
                    {req.status}
                 </span>
                 <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
              </div>
            </MotionDiv>
           )
        })}
      </div>
    </div>
  );
}
