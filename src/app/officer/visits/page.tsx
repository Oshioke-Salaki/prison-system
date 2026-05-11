// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Plus, X, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function OfficerVisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [inmates, setInmates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      inmate_id: '',
      visitor_name: '',
      visit_date: '',
      visit_time: '',
      notes: ''
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [visitsRes, inmatesRes] = await Promise.all([
            supabase.from('visits').select('*, inmate:inmates(first_name, last_name, inmate_number)').order('visit_date', { ascending: false }),
            supabase.from('inmates').select('id, first_name, last_name, inmate_number').order('last_name')
        ]);

        if (visitsRes.data) setVisits(visitsRes.data);
        if (inmatesRes.data) setInmates(inmatesRes.data);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const { data, error } = await supabase
              .from('visits')
              .insert([formData])
              .select('*, inmate:inmates(first_name, last_name, inmate_number)')
              .single();
          
          if (error) throw error;
          
          setVisits([data, ...visits]);
          setShowForm(false);
          setFormData({ inmate_id: '', visitor_name: '', visit_date: '', visit_time: '', notes: '' });
      } catch (error) {
          alert('Error logging visit');
          console.error(error);
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Visitation Log</h1>
                <p className="text-muted-foreground text-sm">Manage inmate visits and schedules</p>
            </div>
            <button 
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? 'Cancel' : 'Log Visit'}
            </button>
        </div>

        {/* New Visit Form */}
        {showForm && (
            <div className="p-6 bg-card border border-white/10 rounded-2xl animate-in slide-in-from-top-4">
                <h3 className="font-bold mb-4">Log New Visit</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Inmate</label>
                        <select 
                            required
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary/50"
                            value={formData.inmate_id}
                            onChange={e => setFormData({...formData, inmate_id: e.target.value})}
                        >
                            <option value="">Select Inmate</option>
                            {inmates.map(inmate => (
                                <option key={inmate.id} value={inmate.id}>
                                    {inmate.last_name}, {inmate.first_name} (#{inmate.inmate_number})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Visitor Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary/50"
                            value={formData.visitor_name}
                            onChange={e => setFormData({...formData, visitor_name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Date</label>
                        <input 
                            required
                            type="date" 
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary/50"
                            value={formData.visit_date}
                            onChange={e => setFormData({...formData, visit_date: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Time</label>
                        <input 
                            required
                            type="time" 
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary/50"
                            value={formData.visit_time}
                            onChange={e => setFormData({...formData, visit_time: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                        <textarea 
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary/50 min-h-[80px]"
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
                            Save Record
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* Visits List */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-card/30">
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-muted-foreground uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Visitor</th>
                            <th className="px-6 py-4">Inmate</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-card/50">
                        {visits.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No visits recorded.</td>
                            </tr>
                        ) : (
                            visits.map((visit) => (
                                <tr key={visit.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                            visit.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                            visit.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            {visit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{visit.visitor_name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {visit.inmate?.first_name} {visit.inmate?.last_name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {visit.visit_date}</span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /> {visit.visit_time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                                        {visit.notes || '-'}
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
