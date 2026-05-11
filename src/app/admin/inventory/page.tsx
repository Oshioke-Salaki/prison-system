// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
      try {
          const { data, error } = await supabase
              .from('inventory')
              .select('*')
              .order('name');
          
          if (error) throw error;
          if (data) setItems(data);
      } catch (error) {
          console.error('Error fetching inventory:', error);
      } finally {
          setLoading(false);
      }
  };

  const deleteItem = async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

      try {
          const { error } = await supabase.from('inventory').delete().eq('id', id);
          if (error) throw error;
          setItems(items.filter(i => i.id !== id));
      } catch (error) {
          alert('Error deleting item');
          console.error(error);
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Store Inventory</h1>
            <Link href="/admin/inventory/new" className="px-4 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Add Product
            </Link>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-card/30">
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
            <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground uppercase text-xs font-semibold">
                    <tr>
                        <th className="px-6 py-4">Product Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-card/50">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                No items in inventory.
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <Package className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    {item.name}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground capitalize">{item.category}</td>
                                <td className="px-6 py-4 font-mono">₦{item.price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`font-bold ${item.stock_quantity < 10 ? 'text-red-400' : 'text-green-400'}`}>
                                        {item.stock_quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={`/admin/inventory/edit/${item.id}`} className="p-2 hover:bg-white/10 rounded-lg text-blue-400">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button 
                                            onClick={() => deleteItem(item.id, item.name)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            )}
        </div>
    </div>
  );
}
