// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Users, FileText, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Link } from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
      totalInmates: 0,
      totalRecords: 0,
      pendingRequests: 0,
      activeIncidents: 0,
      revenue: 0,
      occupancy: { total: 0, occupied: 0, rate: 0 },
      statusCounts: { active: 0, solitary: 0, released: 0 }
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
        // Parallel fetching
        const [inmatesRes, requestsRes, transactionsRes, recentRequestsRes, cellsRes, incidentsRes] = await Promise.all([
            supabase.from('inmates').select('status'),
            supabase.from('requests').select('id', { count: 'exact' }).eq('status', 'pending'),
            supabase.from('transactions').select('amount').eq('type', 'purchase'), // Revenue approximation
            supabase.from('requests').select('id, subject, type, status, created_at, inmate:inmates (first_name, last_name)').order('created_at', { ascending: false }).limit(5),
            supabase.from('cells').select('capacity, current_occupancy'),
            supabase.from('incidents').select('id', { count: 'exact' }).eq('status', 'reported')
        ]);

        const revenue = transactionsRes.data?.reduce((acc, curr) => acc + (Math.abs(curr.amount) || 0), 0) || 0;
        
        // Calculate Cell Stats
        const totalCapacity = cellsRes.data?.reduce((acc, cell) => acc + cell.capacity, 0) || 0;
        const totalOccupancy = cellsRes.data?.reduce((acc, cell) => acc + cell.current_occupancy, 0) || 0;
        const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

        const statusCounts = inmatesRes.data?.reduce((acc: any, curr: any) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, { active: 0, solitary: 0, released: 0 }) || {};

        const totalRecords = inmatesRes.data?.length || 0;
        const currentInmatesCount = (statusCounts.active || 0) + (statusCounts.solitary || 0);

        setStats({
            totalInmates: currentInmatesCount,
            totalRecords: totalRecords,
            pendingRequests: requestsRes.count || 0,
            activeIncidents: incidentsRes.count || 0,
            revenue,
            occupancy: { total: totalCapacity, occupied: totalOccupancy, rate: occupancyRate },
            statusCounts
        });

        if (recentRequestsRes.data) {
            setRecentRequests(recentRequestsRes.data as any);
        }

        setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
      return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back, Warden. Here is the facility status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Inmates" value={stats.totalInmates.toString()} change="Active & Solitary" icon={Users} />
          <StatCard title="Pending Requests" value={stats.pendingRequests.toString()} change="Needs Review" icon={FileText} alert={stats.pendingRequests > 0} />
          <Link href="/admin/incidents" className="block hover:translate-y-[-2px] transition-transform">
            <StatCard title="Active Incidents" value={stats.activeIncidents.toString()} change="Unresolved" icon={AlertCircle} alert={stats.activeIncidents > 0} />
          </Link>
          <StatCard title="Store Revenue" value={`₦${stats.revenue.toFixed(2)}`} change="Total Sales" icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-white/5">
              <h3 className="font-semibold mb-4">Recent Requests</h3>
              <div className="space-y-4">
                  {recentRequests.length === 0 ? (
                      <div className="text-muted-foreground text-sm">No recent requests.</div>
                  ) : (
                      recentRequests.map((req: any) => (
                          <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                      {req.inmate?.first_name?.[0] || '?'}{req.inmate?.last_name?.[0] || '?'}
                                  </div>
                                  <div>
                                      <div className="text-sm font-medium">{req.inmate?.first_name} {req.inmate?.last_name}</div>
                                      <div className="text-xs text-muted-foreground capitalize">{req.subject}</div>
                                  </div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                  req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                  req.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                              }`}>
                                  {req.status}
                              </span>
                          </div>
                      ))
                  )}
              </div>
          </div>
          
           <div className="p-6 rounded-2xl bg-card border border-white/5 flex flex-col h-full">
              <h3 className="font-semibold mb-6">Analytic Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                  {/* Facility Occupancy - Donut Chart */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40 rounded-full flex items-center justify-center"
                        style={{
                            background: `conic-gradient(#3b82f6 ${stats.occupancy.rate}%, rgba(255,255,255,0.1) ${stats.occupancy.rate}%)`
                        }}
                    >
                        <div className="w-32 h-32 bg-[#1E1E24] rounded-full flex flex-col items-center justify-center relative z-10">
                            <span className="text-3xl font-bold">{stats.occupancy.rate}%</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Occupied</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <div className="text-sm font-medium text-white">Total Capacity</div>
                        <div className="text-xs text-muted-foreground">{stats.occupancy.occupied} / {stats.occupancy.total} Cells</div>
                    </div>
                  </div>

                  {/* Inmate Status Breakdown - Enlarged Visual Bar Chart */}
                  <div className="bg-white/5 rounded-2xl border border-white/5 p-6 h-full flex flex-col justify-center">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Population Status</h4>
                      <div className="space-y-6">
                          {[
                              { label: 'Active', count: stats.statusCounts.active, color: 'bg-green-500', text: 'text-green-400' },
                              { label: 'Solitary', count: stats.statusCounts.solitary, color: 'bg-red-500', text: 'text-red-400' },
                              { label: 'Released', count: stats.statusCounts.released, color: 'bg-blue-500', text: 'text-blue-400' }
                          ].map(item => {
                              const percentage = stats.totalRecords > 0 ? Math.round((item.count / stats.totalRecords) * 100) : 0;
                              return (
                                  <div key={item.label}>
                                      <div className="flex justify-between items-end mb-2">
                                          <span className={`font-bold ${item.text}`}>{item.label}</span>
                                          <div className="text-right">
                                              <span className="font-bold text-lg">{item.count}</span>
                                              <span className="text-xs text-muted-foreground ml-2">({percentage}%)</span>
                                          </div>
                                      </div>
                                      <div className="w-full bg-[#1E1E24] rounded-full h-4 overflow-hidden border border-white/5">
                                          <div 
                                              className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                                              style={{ width: `${percentage}%` }}
                                          ></div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, alert }: any) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">{title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${alert ? 'bg-red-500/20 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-xs text-muted-foreground">{change}</div>
        </div>
    )
}
