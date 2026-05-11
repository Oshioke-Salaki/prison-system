// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Box, Users, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function CellsPage() {
  const [cells, setCells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  /* New State for Modal */
  const [selectedCell, setSelectedCell] = useState<any | null>(null);
  const [cellInmates, setCellInmates] = useState<any[]>([]);
  const [inmatesLoading, setInmatesLoading] = useState(false);

  useEffect(() => {
    fetchCells();
  }, []);

  const fetchCells = async () => {
      try {
          const { data, error } = await supabase
              .from('cells')
              .select('*')
              .order('block_name', { ascending: true })
              .order('cell_number', { ascending: true });
          
          if (error) throw error;
          if (data) setCells(data);
      } catch (error) {
          console.error('Error fetching cells:', error);
      } finally {
          setLoading(false);
      }
  };

  /* Fetch Inmates for Selected Cell */
  const handleCellClick = async (cell: any) => {
      setSelectedCell(cell);
      setInmatesLoading(true);
      try {
          const { data, error } = await supabase
              .from('inmates')
              .select('*')
              .eq('cell_id', cell.id);
          
          if (error) throw error;
          setCellInmates(data || []);
      } catch (error) {
          console.error("Error fetching cell inmates:", error);
          alert("Could not load inmates for this cell.");
      } finally {
          setInmatesLoading(false);
      }
  };

  const deleteCell = async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to delete ${name}? This might fail if inmates are assigned.`)) return;

      try {
          const { error } = await supabase.from('cells').delete().eq('id', id);
          if (error) throw error;
          setCells(cells.filter(c => c.id !== id));
      } catch (error) {
          alert('Error deleting cell. Ensure it is empty first.');
          console.error(error);
      }
  };

  return (
    <div className="space-y-6 relative">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Cell Management</h1>
            <Link href="/admin/cells/new" className="px-4 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Add Cell
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
                        <th className="px-6 py-4">Block / Cell</th>
                        <th className="px-6 py-4">Capacity</th>
                        <th className="px-6 py-4">Occupancy</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-card/50">
                    {cells.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                No cells defined.
                            </td>
                        </tr>
                    ) : (
                        cells.map((cell) => {
                            const isFull = cell.current_occupancy >= cell.capacity;
                            return (
                            <tr 
                                key={cell.id} 
                                className="hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => handleCellClick(cell)}
                            >
                                <td className="px-6 py-4 font-medium flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-muted-foreground">
                                        <Box className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-white font-bold">{cell.block_name}</span>
                                        <span className="text-muted-foreground text-xs">Cell {cell.cell_number}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono">{cell.capacity} Inmates</td>
                                <td className="px-6 py-4 font-mono">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        {cell.current_occupancy}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isFull ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {isFull ? 'FULL' : 'AVAILABLE'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteCell(cell.id, `${cell.block_name}-${cell.cell_number}`); }}
                                        className="p-2 hover:bg-white/10 rounded-lg text-red-400 disabled:opacity-50"
                                        disabled={cell.current_occupancy > 0}
                                        title={cell.current_occupancy > 0 ? "Cannot delete occupied cell" : "Delete Cell"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        )})
                    )}
                </tbody>
            </table>
            )}
        </div>

        {/* Inmates Modal */}
        {selectedCell && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedCell(null)}>
                <div 
                    className="bg-[#1E1E24] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">{selectedCell.block_name} - Cell {selectedCell.cell_number}</h2>
                            <p className="text-sm text-muted-foreground">Occupants: {cellInmates.length} / {selectedCell.capacity}</p>
                        </div>
                        <button onClick={() => setSelectedCell(null)} className="p-2 hover:bg-white/10 rounded-lg">
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>
                    
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {inmatesLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : cellInmates.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                No inmates assigned to this cell.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cellInmates.map(inmate => (
                                    <div key={inmate.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                         <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                            {inmate.first_name[0]}{inmate.last_name[0]}
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-medium text-white group-hover:text-primary transition-colors">{inmate.first_name} {inmate.last_name}</h4>
                                             <p className="text-xs text-muted-foreground">ID: #{inmate.inmate_number}</p>
                                         </div>
                                         <Link 
                                            href={`/admin/inmates/edit/${inmate.id}`}
                                            className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                         >
                                            View
                                         </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
