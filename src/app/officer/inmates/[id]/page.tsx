// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Calendar, FileText, MapPin, Shield, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OfficerInmateDetails() {
  const { id } = useParams();
  const [inmate, setInmate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchInmate = async () => {
      try {
        const { data, error } = await supabase
          .from('inmates')
          .select('*, cells(block_name, cell_number)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setInmate(data);
      } catch (error) {
        console.error('Error fetching inmate:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
        fetchInmate();
    }
  }, [id]);

  if (loading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!inmate) {
      return (
          <div className="flex flex-col items-center justify-center h-screen space-y-4">
              <h1 className="text-2xl font-bold text-red-500">Inmate Not Found</h1>
              <Link href="/officer" className="text-muted-foreground hover:text-white flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
          </div>
      );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-4">
            <Link href="/officer" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold">Inmate Profile</h1>
                <p className="text-muted-foreground text-sm">#{inmate.inmate_number}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Info Card */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                            {inmate.photo_url ? (
                                <img src={inmate.photo_url} alt="Inmate" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <User className="w-10 h-10 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-xl font-bold">{inmate.first_name} {inmate.last_name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                        inmate.status === 'active' ? 'bg-green-500/20 text-green-500' :
                                        inmate.status === 'solitary' ? 'bg-red-500/20 text-red-500' :
                                        'bg-blue-500/20 text-blue-500'
                                    }`}>
                                        {inmate.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground font-medium uppercase">Date of Birth</span>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-3.5 h-3.5 text-white/50" />
                                        {inmate.date_of_birth || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground font-medium uppercase">Offense</span>
                                    <div className="flex items-center gap-2 text-sm capitalize">
                                        <FileText className="w-3.5 h-3.5 text-white/50" />
                                        {inmate.offense || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-white/10 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Sentence Details
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Start Date</span>
                            <span className="font-mono text-lg">{inmate.sentence_start_date || 'N/A'}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Projected Release</span>
                            <span className="font-mono text-lg text-primary">{inmate.sentence_end_date || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
                <div className="bg-card border border-white/10 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-orange-400" />
                        Location
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                            {inmate.cells ? (
                                <>
                                    <div className="text-sm text-orange-300 font-medium mb-1">Current Assignment</div>
                                    <div className="text-2xl font-bold text-orange-400">
                                        {inmate.cells.block_name}
                                    </div>
                                    <div className="text-sm text-orange-300/80">
                                        Cell {inmate.cells.cell_number}
                                    </div>
                                </>
                            ) : (
                                <div className="text-orange-300">Unassigned</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
