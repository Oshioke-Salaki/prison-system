// @ts-nocheck
'use client';

import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, ShoppingBag } from 'lucide-react';

export default function WalletPage() {
  const transactions = [
     { id: 1, type: 'deposit', amount: 50.00, description: 'Family Deposit', date: '2025-05-10' },
     { id: 2, type: 'purchase', amount: -4.50, description: 'Store Purchase', date: '2025-05-08' },
     { id: 3, type: 'purchase', amount: -12.00, description: 'Store Purchase', date: '2025-05-05' },
     { id: 4, type: 'deposit', amount: 100.00, description: 'Work Program Earnings', date: '2025-05-01' },
  ];

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row gap-6">
           {/* Balance Card */}
           <div className="flex-1 p-8 rounded-3xl bg-gradient-to-br from-green-900/50 to-emerald-900/20 border border-green-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px]"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2 opacity-80">
                        <Wallet className="w-5 h-5" />
                        <span className="font-medium text-sm uppercase tracking-wider">Available Balance</span>
                    </div>
                    <div className="text-5xl font-bold font-mono">₦142.50</div>
                </div>
           </div>

           {/* Stats */}
           <div className="w-full md:w-64 grid grid-rows-2 gap-4">
               <div className="p-4 rounded-2xl bg-card border border-white/10 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                       <ArrowDownLeft className="w-5 h-5" />
                   </div>
                   <div>
                       <div className="text-xs text-muted-foreground">Total Incoming</div>
                       <div className="font-bold text-lg">₦1,240.00</div>
                   </div>
               </div>
               <div className="p-4 rounded-2xl bg-card border border-white/10 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                       <ArrowUpRight className="w-5 h-5" />
                   </div>
                   <div>
                       <div className="text-xs text-muted-foreground">Total Spent</div>
                       <div className="font-bold text-lg">₦895.50</div>
                   </div>
               </div>
           </div>
       </div>

       <div>
           <h2 className="text-xl font-bold mb-6">Transaction History</h2>
           <div className="rounded-2xl border border-white/10 overflow-hidden bg-card/30">
               <table className="w-full text-left text-sm">
                   <thead className="bg-white/5 uppercase text-xs font-semibold text-muted-foreground">
                       <tr>
                           <th className="px-6 py-4">Title</th>
                           <th className="px-6 py-4">Date</th>
                           <th className="px-6 py-4 text-right">Amount</th>
                           <th className="px-6 py-4">Status</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                       {transactions.map((tx) => (
                           <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                               <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                           tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-white/10 text-white'
                                       }`}>
                                           {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                                       </div>
                                       <span className="font-medium">{tx.description}</span>
                                   </div>
                               </td>
                               <td className="px-6 py-4 text-muted-foreground">{tx.date}</td>
                               <td className={`px-6 py-4 text-right font-mono font-bold ${
                                   tx.type === 'deposit' ? 'text-green-400' : 'text-white'
                               }`}>
                                   {tx.type === 'deposit' ? '+' : ''}{tx.amount.toFixed(2)}
                               </td>
                               <td className="px-6 py-4">
                                   <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">Completed</span>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>
    </div>
  );
}
