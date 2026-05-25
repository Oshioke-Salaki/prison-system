// @ts-nocheck
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, ShoppingBag, PlusCircle, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const MotionDiv = React.memo((props: any) => {
  const { motion } = require('framer-motion');
  return <motion.div {...props} />;
});

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [inmate, setInmate] = React.useState<any>(null);
  const [balance, setBalance] = React.useState<number>(0);

  React.useEffect(() => {
      fetchInmateData();
  }, []);

  const fetchInmateData = async () => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: inmateData } = await supabase
              .from('inmates')
              .select('id, first_name, last_name, inmate_number')
              .eq('profile_id', user.id)
              .single();
              
          if (inmateData) {
              setInmate(inmateData);
              const { data: walletData } = await supabase
                  .from('wallets')
                  .select('balance')
                  .eq('inmate_id', inmateData.id)
                  .single();
              if (walletData) {
                  setBalance(walletData.balance);
              }
          }
      } catch (error) {
          console.error("Error fetching inmate data:", error);
      }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Home', href: '/kiosk' },
    { icon: PlusCircle, label: 'New Request', href: '/kiosk/requests' },
    { icon: ShoppingBag, label: 'Store', href: '/kiosk/store' },
    { icon: Wallet, label: 'Wallet', href: '/kiosk/wallet' },
  ];

  const initials = inmate ? `${inmate.first_name[0]}${inmate.last_name[0]}` : 'JD';
  const fullName = inmate ? `${inmate.first_name} ${inmate.last_name}` : 'Loading...';
  const inmateNo = inmate ? `#${inmate.inmate_number}` : '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-20 border-b border-white/10 bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 z-20 sticky top-0">
         <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="font-bold text-sm uppercase">{initials}</span>
             </div>
             <div>
                 <div className="font-bold">{fullName}</div>
                 <div className="text-xs text-muted-foreground font-mono">{inmateNo}</div>
             </div>
         </div>

         <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end">
                 <span className="text-xs text-muted-foreground">Current Balance</span>
                 <span className="font-bold text-xl text-green-400">₦{balance.toFixed(2)}</span>
             </div>
             
             <Link 
                href="/kiosk/settings"
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
             >
                <Settings className="w-5 h-5 text-muted-foreground" />
             </Link>
             
             <button 
                onClick={handleLogout}
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-red-400 hover:text-red-300"
             >
                <LogOut className="w-5 h-5" />
             </button>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
         <div className="max-w-4xl mx-auto p-6">
            <MotionDiv
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                {children}
            </MotionDiv>
         </div>
      </main>

      {/* Bottom Nav (Mobile/Touch Friendly) */}
      <nav className="h-24 bg-card border-t border-white/10 grid grid-cols-4 px-4 pb-4 pt-2">
          {menuItems.map((item) => (
             <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                    pathname === item.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-white/5"
                )}
             >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-semibold">{item.label}</span>
             </Link>
          ))}
      </nav>
    </div>
  );
}
