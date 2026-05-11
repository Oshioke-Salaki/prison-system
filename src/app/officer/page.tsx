// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Users, FileText, Calendar, Activity, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function OfficerDashboard() {
  const [stats, setStats] = useState({
      totalInmates: 0,
      pendingRequests: 0,
      todayVisits: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
        const today = new Date().toISOString().split('T')[0];

        // Parallel fetching
        const [inmatesRes, requestsRes, visitsRes, recentRequestsRes] = await Promise.all([
            supabase.from('inmates').select('id', { count: 'exact' }),
            supabase.from('requests').select('id', { count: 'exact' }).eq('status', 'pending'),
            supabase.from('visits').select('id', { count: 'exact' }).eq('visit_date', today),
            supabase.from('requests')
                .select('id, subject, type, status, created_at, inmate:inmates (first_name, last_name, inmate_number)')
                .order('created_at', { ascending: false })
                .limit(5)
        ]);

        setStats({
            totalInmates: inmatesRes.count || 0,
            pendingRequests: requestsRes.count || 0,
            todayVisits: visitsRes.count || 0
        });

        if (recentRequestsRes.data) {
             setRecentActivity(recentRequestsRes.data);
        }

        setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Officer Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of facility status and assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Inmates" 
            value={stats.totalInmates.toString()} 
            icon={Users} 
            color="text-blue-500" 
            bgColor="bg-blue-500/10"
            link="/officer/inmates"
          />
          <StatCard 
            title="Pending Requests" 
            value={stats.pendingRequests.toString()} 
            icon={FileText} 
            color="text-yellow-500" 
            bgColor="bg-yellow-500/10" 
            alert={stats.pendingRequests > 0}
            link="/officer/requests"
          />
          <StatCard 
            title="Today's Visits" 
            value={stats.todayVisits.toString()} 
            icon={Calendar} 
            color="text-purple-500" 
            bgColor="bg-purple-500/10"
            link="/officer/visits"
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                  <Link href="/officer/inmates" className="p-4 rounded-xl bg-card border border-white/5 hover:border-primary/50 transition-all group">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="font-medium">Inmate List</div>
                      <div className="text-xs text-muted-foreground mt-1">View all prisoners</div>
                  </Link>
                  <Link href="/officer/requests" className="p-4 rounded-xl bg-card border border-white/5 hover:border-primary/50 transition-all group">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="font-medium">Review Requests</div>
                      <div className="text-xs text-muted-foreground mt-1">Approve pending</div>
                  </Link>
              </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Recent Requests
                  </h3>
                  <Link href="/officer/requests" className="text-xs text-primary hover:underline flex items-center gap-1">
                      View All <ArrowRight className="w-3 h-3" />
                  </Link>
              </div>
              
              <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                      <div className="text-muted-foreground text-sm py-4 text-center bg-white/5 rounded-xl">No recent activity.</div>
                  ) : (
                      recentActivity.map((item: any) => (
                          <div key={item.id} className="p-3 rounded-xl bg-card border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold 
                                      ${item.type === 'medical' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                      {item.type[0].toUpperCase()}
                                  </div>
                                  <div>
                                      <div className="text-sm font-medium">{item.subject}</div>
                                      <div className="text-xs text-muted-foreground">
                                          {item.inmate?.first_name} {item.inmate?.last_name} (#{item.inmate?.inmate_number})
                                      </div>
                                  </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                      item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                                  }`}>
                                      {item.status}
                                  </span>
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(item.created_at).toLocaleDateString()}
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor, alert, link }: any) {
    const Content = (
        <>
            <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">{title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgColor} ${color}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="text-3xl font-bold">{value}</div>
            {alert && (
                <div className="mt-2 text-xs text-red-400 font-medium flex items-center gap-1">
                    Attention Needed
                </div>
            )}
        </>
    );

    if (link) {
        return (
            <Link href={link} className="block p-6 rounded-2xl bg-card border border-white/5 hover:border-primary/30 transition-all hover:translate-y-[-2px]">
                {Content}
            </Link>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-card border border-white/5">
            {Content}
        </div>
    );
}
