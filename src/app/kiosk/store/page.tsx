// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ShoppingCart, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function StorePage() {
  const [cart, setCart] = useState<any[]>([]);
  
  const items = [
     { id: 1, name: 'Instant Noodles', price: 1.50, category: 'Food', image: 'https://placehold.co/200x200/18181b/FFF?text=Noodles' },
     { id: 2, name: 'Bar of Soap', price: 2.00, category: 'Hygiene', image: 'https://placehold.co/200x200/18181b/FFF?text=Soap' },
     { id: 3, name: 'Writing Pad', price: 3.50, category: 'Stationery', image: 'https://placehold.co/200x200/18181b/FFF?text=Pad' },
     { id: 4, name: 'Snack Bar', price: 1.25, category: 'Food', image: 'https://placehold.co/200x200/18181b/FFF?text=Snack' },
     { id: 5, name: 'Toothpaste', price: 4.00, category: 'Hygiene', image: 'https://placehold.co/200x200/18181b/FFF?text=Toothpaste' },
     { id: 6, name: 'Comb', price: 1.00, category: 'Hygiene', image: 'https://placehold.co/200x200/18181b/FFF?text=Comb' },
  ];

  const addToCart = (item: any) => {
     // Logic to add to cart
     setCart([...cart, item]);
  };

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
                  <input type="text" placeholder="Search items..." className="pl-9 pr-4 py-3 bg-card border border-white/10 rounded-xl w-64 focus:outline-none focus:border-primary/50" />
               </div>
               <button className="relative p-3 bg-card border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                   <ShoppingCart className="w-5 h-5" />
                   {cart.length > 0 && (
                       <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                           {cart.length}
                       </span>
                   )}
               </button>
           </div>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {items.map((item, i) => (
               <MotionDiv
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all flex flex-col"
               >
                   <div className="aspect-square bg-white/5 relative overflow-hidden">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
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
    </div>
  );
}
