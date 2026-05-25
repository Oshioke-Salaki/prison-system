// @ts-nocheck
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, FileText, Calendar, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const MotionDiv = React.memo((props: any) => {
  const { motion } = require('framer-motion');
  return <motion.div {...props} />;
});

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { icon: Shield, label: 'Dashboard', href: '/officer' },
    { icon: Users, label: 'Inmates', href: '/officer/inmates' },
    { icon: FileText, label: 'Requests', href: '/officer/requests' },
    { icon: Calendar, label: 'Visits', href: '/officer/visits' },
    { icon: Settings, label: 'Settings', href: '/officer/settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-card/50 backdrop-blur-xl flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Sentinell<span className="text-blue-500 text-xs ml-1">OFFICER</span></span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                pathname === item.href 
                  ? "bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-500/10" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-blue-400" : "text-muted-foreground group-hover:text-white")} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative overflow-hidden bg-background">
         <div className="relative z-10 p-8">
            <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {children}
            </MotionDiv>
         </div>
      </main>
    </div>
  );
}
