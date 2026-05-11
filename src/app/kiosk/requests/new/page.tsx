// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

const MotionDiv = motion.div as any;

export default function NewRequestPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('medical');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const requestTypes = [
    { id: 'medical', label: 'Medical Service' },
    { id: 'food', label: 'Food / Diet' },
    { id: 'education', label: 'Education Program' },
    { id: 'visit', label: 'Visitation' },
    { id: 'item', label: 'Personal Item' },
    { id: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push('/kiosk/requests');

    // Real submission:
    // const { error } = await supabase.from('requests').insert({
    //     type, subject, description, inmate_id: '...' // handled by trigger or RLS inferring user
    // });
  };

  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/kiosk/requests" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
       </Link>

       <MotionDiv 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="bg-card border border-white/10 rounded-2xl p-8"
       >
          <div className="mb-8">
             <h1 className="text-2xl font-bold mb-2">Submit New Request</h1>
             <p className="text-muted-foreground">Officer will review your request within 24 hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Request Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {requestTypes.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setType(t.id)}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                                type === t.id 
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                : 'bg-background border-white/10 hover:border-white/30 text-muted-foreground'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <input 
                    type="text" 
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Brief title of your request"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                    required
                />
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Details</label>
                <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Explain your needs in detail..."
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 min-h-[150px] focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
             </div>

             <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
             >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Request</>}
             </button>
          </form>
       </MotionDiv>
    </div>
  );
}
