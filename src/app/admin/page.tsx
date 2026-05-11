// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Users, FileText, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Link } from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
      totalInmates: 0,
      pendingRequests: 0,
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
        const [inmatesRes, requestsRes, transactionsRes, recentRequestsRes, cellsRes] = await Promise.all([
            supabase.from('inmates').select('status'),
            supabase.from('requests').select('id', { count: 'exact' }).eq('status', 'pending'),
            supabase.from('transactions').select('amount').eq('type', 'purchase'), // Revenue approximation
            supabase.from('requests').select('id, subject, type, status, created_at, inmate:inmates (first_name, last_name)').order('created_at', { ascending: false }).limit(5),
            supabase.from('cells').select('capacity, current_occupancy')
        ]);

        const revenue = transactionsRes.data?.reduce((acc, curr) => acc + (Math.abs(curr.amount) || 0), 0) || 0;
        
        // Calculate Cell Stats
        const totalCapacity = cellsRes.data?.reduce((acc, cell) => acc + cell.capacity, 0) || 0;
        const totalOccupancy = cellsRes.data?.reduce((acc, cell) => acc + cell.current_occupancy, 0) || 0;
        const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

        // Calculate Inmate Status Stats
        const statusCounts = inmatesRes.data?.reduce((acc: any, curr: any) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, { active: 0, solitary: 0, released: 0 }) || {};

        setStats({
            totalInmates: inmatesRes.data?.length || 0,
            pendingRequests: requestsRes.count || 0,
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
          <StatCard title="Total Inmates" value={stats.totalInmates.toString()} change="Registered" icon={Users} />
          <StatCard title="Pending Requests" value={stats.pendingRequests.toString()} change="Needs Review" icon={FileText} alert={stats.pendingRequests > 0} />
          <StatCard title="Incidents" value="0" change="Last 7 days" icon={AlertCircle} />
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

                  {/* Inmate Status Breakdown - Table */}
                  <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                      <table className="w-full text-sm">
                          <thead className="bg-white/5 text-xs text-muted-foreground uppercase font-semibold text-left">
                              <tr>
                                  <th className="px-4 py-3">Status</th>
                                  <th className="px-4 py-3 text-right">Count</th>
                                  <th className="px-4 py-3 text-right">%</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {[
                                  { label: 'Active', count: stats.statusCounts.active, color: 'text-green-400' },
                                  { label: 'Solitary', count: stats.statusCounts.solitary, color: 'text-red-400' },
                                  { label: 'Released', count: stats.statusCounts.released, color: 'text-blue-400' }
                              ].map(item => (
                                  <tr key={item.label} className="hover:bg-white/5 transition-colors">
                                      <td className={`px-4 py-3 font-medium ${item.color}`}>{item.label}</td>
                                      <td className="px-4 py-3 text-right font-mono">{item.count}</td>
                                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                                          {stats.totalInmates > 0 ? Math.round((item.count / stats.totalInmates) * 100) : 0}%
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
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
