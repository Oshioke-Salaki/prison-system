// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function NewCellPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      block_name: 'Block A',
      cell_number: '',
      capacity: '2'
  });

  const blocks = ['Block A', 'Block B', 'Block C', 'Solitary', 'Medical'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.cell_number || !formData.capacity) {
        alert("Please fill required fields");
        setLoading(false);
        return;
    }

    try {
        const { error } = await supabase.from('cells').insert([
            {
                block_name: formData.block_name,
                cell_number: formData.cell_number,
                capacity: parseInt(formData.capacity),
                current_occupancy: 0
            }
        ]);

        if (error) {
            if (error.code === '23505') throw new Error('Cell already exists in this block.');
            throw error;
        }

        router.push('/admin/cells');
        router.refresh(); 
    } catch (err: any) {
        alert(`Error adding cell: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
       <Link href="/admin/cells" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Cells
       </Link>

       <MotionDiv 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="bg-card border border-white/10 rounded-2xl p-8"
       >
          <div className="mb-8">
             <h1 className="text-2xl font-bold mb-2">Create New Cell</h1>
             <p className="text-muted-foreground">Define capacity and location for a new cell.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Block Name</label>
                <select 
                    name="block_name"
                    value={formData.block_name}
                    onChange={handleChange}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                >
                    {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
             </div>

             <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Cell Number</label>
                    <input 
                        name="cell_number"
                        placeholder="e.g. 101"
                        value={formData.cell_number}
                        onChange={handleChange}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                        required
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                    <input 
                        name="capacity"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.capacity}
                        onChange={handleChange}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                        required
                    />
                 </div>
             </div>

             <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Create Cell</>}
                </button>
             </div>
          </form>
       </MotionDiv>
    </div>
  );
}
