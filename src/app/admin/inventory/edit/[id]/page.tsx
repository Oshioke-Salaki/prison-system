// @ts-nocheck
'use client';


import { createClient } from '@/lib/supabase';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { use } from 'react';


const MotionDiv = React.memo((props: any) => {
  const { motion } = require('framer-motion');
  return <motion.div {...props} />;
});

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      category: 'Food',
      price: '',
      stock: '',
      image_url: ''
  });

  const categories = ['Food', 'Hygiene', 'Stationery', 'Clothing', 'Electronics'];

  useEffect(() => {
    // Unwrapping params for Next.js 15+ if needed, or simple access for 14
    // Safe to just fetch assuming id is there
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
          setFormData({
              name: data.name,
              category: data.category,
              price: data.price.toString(),
              stock: data.stock_quantity.toString(),
              image_url: data.image_url || ''
          });
      }
      setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.name || !formData.price || !formData.stock) {
        alert("Please fill required fields");
        setSaving(false);
        return;
    }

    try {
        const { error } = await supabase.from('inventory').update({
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock),
                image_url: formData.image_url || null
            })
            .eq('id', id);

        if (error) throw error;

        router.push('/admin/inventory');
        router.refresh(); 
    } catch (err: any) {
        alert(`Error updating product: ${err.message}`);
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/admin/inventory" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
       </Link>

       <MotionDiv 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="bg-card border border-white/10 rounded-2xl p-8"
       >
          <div className="mb-8">
             <h1 className="text-2xl font-bold mb-2">Edit Product</h1>
             <p className="text-muted-foreground">Update product details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                    required
                />
             </div>

             <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <select 
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Price ($)</label>
                    <input 
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                        required
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Stock</label>
                    <input 
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                        required
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Image URL (Optional)</label>
                    <input 
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                 </div>
             </div>

             <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Product</>}
                </button>
             </div>
          </form>
       </MotionDiv>
    </div>
  );
}
