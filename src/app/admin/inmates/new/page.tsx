// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2, ArrowLeft, Save, Upload, User, FileText, Calendar, Box } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function NewInmatePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [availableCells, setAvailableCells] = useState<any[]>([]);
  const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      offense: '',
      sentence_start: '',
      sentence_end: '',
      cell_id: '',
      status: 'active'
  });

  useEffect(() => {
      const fetchCells = async () => {
          // Fetch cells where occupancy < capacity
          // Note: Supabase postgrest doesn't support complex filtering like "col1 < col2" directly in simple query builder easily without raw SQL or rpc, 
          // but we can fetch all and filter client side for now as dataset is small, or use a filter if configured.
          // For simplicity and to ensure we get "available" cells, let's fetch all and filter.
          const { data, error } = await supabase.from('cells').select('*').order('block_name');
          if (data) {
              setAvailableCells(data.filter((c: any) => c.current_occupancy < c.capacity));
          }
      };
      
      fetchCells();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Auto-generate Inmate ID (Simple random 6 digit)
    const inmate_number = Math.floor(100000 + Math.random() * 900000).toString();
    const defaultPassword = '1234';
    const email = `${inmate_number}@sentinell.inmate`;

    const sanitizedData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        inmate_number,
        cell_id: formData.cell_id === '' ? null : formData.cell_id,
        date_of_birth: formData.date_of_birth === '' ? null : formData.date_of_birth,
        offense: formData.offense,
        sentence_start_date: formData.sentence_start === '' ? null : formData.sentence_start,
        sentence_end_date: formData.sentence_end === '' ? null : formData.sentence_end,
        status: formData.status
    };

    try {
        if (sanitizedData.cell_id) {
            // Strict check
            const { data: cell } = await supabase.from('cells').select('capacity, current_occupancy').eq('id', sanitizedData.cell_id).single();
            if (cell && cell.current_occupancy >= cell.capacity) {
                alert("Error: The selected cell is already at maximum capacity.");
                setLoading(false);
                return;
            }
        }

        // 1. Create Auth User via API route
        const res = await fetch('/api/auth/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password: defaultPassword, 
                role: 'inmate', 
                firstName: sanitizedData.first_name, 
                lastName: sanitizedData.last_name 
            })
        });
        
        const authData = await res.json();
        if (!res.ok) throw new Error(authData.error);

        sanitizedData.profile_id = authData.user.id;

        // 2. Insert inmate record
        const { error } = await supabase.from('inmates').insert([sanitizedData]);

        if (error) throw error;

        if (sanitizedData.cell_id) {
            const { error: rpcError } = await supabase.rpc('increment_cell_occupancy', { row_id: sanitizedData.cell_id });
            if (rpcError) {
                const { data: c } = await supabase.from('cells').select('current_occupancy').eq('id', sanitizedData.cell_id).single();
                if (c) {
                    await supabase.from('cells').update({ current_occupancy: c.current_occupancy + 1 }).eq('id', sanitizedData.cell_id);
                }
            }
        }

        alert(`Inmate successfully registered!\nLogin Email: ${email}\nDefault Password: ${defaultPassword}`);
        router.push('/admin/inmates');
        router.refresh(); 
    } catch (err: any) {
        alert(`Error adding inmate: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
       <div className="flex items-center gap-4 mb-8">
            <Link href="/admin/inmates" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
                 <h1 className="text-2xl font-bold">Register New Inmate</h1>
                 <p className="text-muted-foreground">Create a new inmate record in the system.</p>
            </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Photo & Basic Info */}
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-1 space-y-6"
            >
                <div className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mb-4 cursor-pointer hover:border-primary/50 hover:bg-white/10 transition-all group">
                        <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-sm font-medium">Upload Photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG</p>
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
                                        {cell.block_name} - Cell {cell.cell_number} ({cell.current_occupancy}/{cell.capacity})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">Only showing cells with available capacity.</p>
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
                        <button type="submit" disabled={loading} className="px-8 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all font-bold flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Register Inmate
                        </button>
                    </div>

                </form>
            </MotionDiv>
       </div>
    </div>
  );
}