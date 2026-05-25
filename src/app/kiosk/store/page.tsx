// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';

const MotionDiv = motion.div as any;

export default function StorePage() {
  const [cart, setCart] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
      fetchItems();
  }, []);

  const fetchItems = async () => {
      try {
          const { data, error } = await supabase.from('inventory').select('*').gt('stock_quantity', 0);
          if (error) throw error;
          if (data) setItems(data);
      } catch (error) {
          console.error("Error fetching items:", error);
      } finally {
          setLoading(false);
      }
  };

  const addToCart = (item: any) => {
     setCart([...cart, item]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
      if (cart.length === 0) return;
      setCheckoutLoading(true);

      try {
          // 1. Get current user's inmate profile
          const { data: { user } } = await supabase.auth.getUser();
          
          let inmateId;
          if (user) {
              const { data: inmate } = await supabase.from('inmates').select('id').eq('profile_id', user.id).single();
              inmateId = inmate?.id;
          }

          if (!inmateId) {
              // Fallback for demo mode
              const { data: demoInmate } = await supabase.from('inmates').select('id').limit(1).single();
              if (demoInmate) inmateId = demoInmate.id;
              else throw new Error("Could not find associated inmate record.");
          }

          // 2. Get wallet balance
          const { data: wallet } = await supabase.from('wallets').select('*').eq('inmate_id', inmateId).single();
          if (!wallet) throw new Error("Wallet not found.");

          if (wallet.balance < cartTotal) {
              alert("Insufficient funds in wallet.");
              setCheckoutLoading(false);
              return;
          }

          // 3. Deduct from wallet and create transaction
          const newBalance = wallet.balance - cartTotal;
          await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);

          await supabase.from('transactions').insert([
              {
                  wallet_id: wallet.id,
                  type: 'purchase',
                  amount: -cartTotal,
                  description: `Commissary Purchase: ${cart.map(c => c.name).join(', ')}`,
                  status: 'completed'
              }
          ]);

          // Optional: Deduct stock from inventory
          // For simplicity, we skip complex inventory deduction here, but it could be added.

          alert(`Successfully purchased for ₦${cartTotal.toFixed(2)}`);
          setCart([]);
      } catch (error: any) {
          alert(`Checkout failed: ${error.message}`);
          console.error(error);
      } finally {
          setCheckoutLoading(false);
      }
  };

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
           <div>
               <h1 className="text-2xl font-bold">Commissary</h1>
               <p className="text-muted-foreground">Purchase approved items</p>
           </div>
           
           <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-3 bg-card border border-white/10 rounded-xl w-64 focus:outline-none focus:border-primary/50" />
               </div>
               <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || checkoutLoading}
                  className="relative px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
               >
                   {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                   Checkout {cart.length > 0 && `(₦${cartTotal.toFixed(2)})`}
               </button>
           </div>
       </div>

       {loading ? (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
       ) : (
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {filteredItems.map((item, i) => (
               <MotionDiv
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all flex flex-col"
               >
                   <div className="aspect-square bg-white/5 relative overflow-hidden">
                       <img src={item.image_url || `https://placehold.co/200x200/18181b/FFF?text=${item.name}`} alt={item.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                       <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-medium text-white">
                           {item.category}
                       </div>
                   </div>
                   <div className="p-4 flex-1 flex flex-col">
                       <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                       <div className="flex items-center justify-between mt-auto">
                           <span className="text-xl font-bold text-green-400">₦{item.price.toFixed(2)}</span>
                           <button 
                              onClick={() => addToCart(item)}
                              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                           >
                               <ShoppingCart className="w-4 h-4" />
                           </button>
                       </div>
                   </div>
               </MotionDiv>
           ))}
       </div>
       )}
    </div>
  );
}
