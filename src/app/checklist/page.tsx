'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

export default function ChecklistPage() {
    const steps = [
        { title: "Define Requirements", status: "completed" },
        { title: "System Architecture Design", status: "completed" },
        { title: "Database Schema Setup", status: "completed" },
        { title: "Authentication Implementation", status: "completed" },
        { title: "Admin Board Development", status: "in-progress" },
        { title: "Kiosk Interface Development", status: "in-progress" },
        { title: "Officer Mobile App", status: "pending" },
        { title: "System Integration Testing", status: "pending" },
        { title: "Pilot Deployment", status: "pending" }
    ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="container mx-auto max-w-3xl pt-20">
         <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Implementation Checklist</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Track the progress of the Sentinell System deployment at your facility.
        </p>
        
        <div className="space-y-4">
            {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                    {step.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : step.status === 'in-progress' ? (
                         <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                    <span className={`font-medium ${step.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                    </span>
                    <span className="ml-auto text-xs uppercase tracking-wider font-semibold opacity-50">
                        {step.status}
                    </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
