// @ts-nocheck
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2, ArrowLeft, Save, Upload, User, FileText, Calendar, Box } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function EditInmatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableCells, setAvailableCells] = useState<any[]>([]);
  const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      offense: '',
      sentence_start: '',
      sentence_end: '',
      cell_id: '',
      status: 'active',
      inmate_number: ''
  });

  useEffect(() => {
      const fetchData = async () => {
          // Fetch Inmate
          const { data: inmate, error: inmateError } = await supabase
            .from('inmates')
            .select('*')
            .eq('id', id)
            .single();

          if (inmateError) {
              console.error(inmateError);
              alert('Error fetching inmate');
              router.push('/admin/inmates');
              return;
          }

          setFormData({
              first_name: inmate.first_name,
              last_name: inmate.last_name,
              date_of_birth: inmate.date_of_birth || '',
              offense: inmate.offense || '',
              sentence_start: inmate.sentence_start_date || '',
              sentence_end: inmate.sentence_end_date || '',
              cell_id: inmate.cell_id || '',
              status: inmate.status,
              inmate_number: inmate.inmate_number
          });

          // Fetch Cells
          const { data: cells } = await supabase.from('cells').select('*').order('block_name');
          if (cells) {
              // We want to show all available cells PLUS the currently assigned cell (if valid)
              // even if it's full (it shouldn't be full if they are in it, but just simply logic:
              // show if occupancy < capacity OR if it is the current cell)
              setAvailableCells(cells.filter((c: any) => 
                  c.current_occupancy < c.capacity || c.id === inmate.cell_id
              ));
          }
          setLoading(false);
      };
      
      fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const sanitizedData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        cell_id: formData.cell_id === '' ? null : formData.cell_id,
        date_of_birth: formData.date_of_birth === '' ? null : formData.date_of_birth,
        sentence_start_date: formData.sentence_start === '' ? null : formData.sentence_start,
        sentence_end_date: formData.sentence_end === '' ? null : formData.sentence_end,
        offense: formData.offense,
        status: formData.status
    };

    try {
        const { error } = await supabase
            .from('inmates')
            .update(sanitizedData)
            .eq('id', id);

        if (error) throw error;

        router.push('/admin/inmates');
        router.refresh(); 
    } catch (err: any) {
        alert(`Error updating inmate: ${err.message}`);
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex text-center justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
       <div className="flex items-center gap-4 mb-8">
            <Link href="/admin/inmates" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
                 <h1 className="text-2xl font-bold">Edit Inmate: #{formData.inmate_number}</h1>
                 <p className="text-muted-foreground">Update inmate records and housing.</p>
            </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Photo */}
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-1 space-y-6"
            >
                <div className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mb-4 cursor-pointer hover:border-primary/50 hover:bg-white/10 transition-all group">
                        <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-sm font-medium">Update Photo</p>
                </div>
            </MotionDiv>

            {/* Right Column - Form */}
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
            >
                <form onSubmit={handleSubmit} className="bg-card border border-white/10 rounded-2xl p-8 space-y-8">
                    
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b border-white/5 pb-2">
                            <User className="w-4 h-4" /> Personal Information
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-muted-foreground">First Name</label>
                                <input name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-muted-foreground">Last Name</label>
                                <input name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-muted-foreground">Date of Birth</label>
                                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-muted-foreground">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50">
                                    <option value="active">Active</option>
                                    <option value="solitary">Solitary</option>
                                    <option value="released">Released</option>
                                    <option value="transferred">Transferred</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cell Assignment */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b border-white/5 pb-2">
                            <Box className="w-4 h-4" /> Housing Assignment
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-muted-foreground">Assign Cell</label>
                            <select 
                                name="cell_id" 
                                value={formData.cell_id} 
                                onChange={handleChange} 
                                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 appearance-none"
                            >
                                <option value="">-- No Cell Assigned --</option>
                                {availableCells.map(cell => (
                                    <option key={cell.id} value={cell.id}>
                                        {cell.block_name} - Cell {cell.cell_number} ({cell.current_occupancy}/{cell.capacity}) {cell.id === formData.cell_id ? '(Current)' : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">Only showing available cells.</p>
                        </div>
                    </div>

                    {/* Legal & Sentence */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b border-white/5 pb-2">
                            <FileText className="w-4 h-4" /> Legal & Sentence
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-muted-foreground">Offense</label>
                            <input name="offense" value={formData.offense} onChange={handleChange} required className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-muted-foreground">Sentence Start</label>
                                <input type="date" name="sentence_start" value={formData.sentence_start} onChange={handleChange} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-muted-foreground">Sentence End</label>
                                <input type="date" name="sentence_end" value={formData.sentence_end} onChange={handleChange} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-xl hover:bg-white/5 transition-colors font-medium">Cancel</button>
                        <button type="submit" disabled={saving} className="px-8 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all font-bold flex items-center gap-2">
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Update Inmate
                        </button>
                    </div>

                </form>
            </MotionDiv>
       </div>
    </div>
  );
}
