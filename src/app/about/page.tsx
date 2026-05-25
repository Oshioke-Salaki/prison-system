'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Users, Building, Cpu } from 'lucide-react';

const MotionDiv = motion.div as any;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar Minimal */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Sentinell<span className="text-primary">.</span></span>
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 container mx-auto max-w-5xl">
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 border-b border-white/10 pb-16"
        >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Sentinell</h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                Sentinell is a modern, digital-first prison management and rehabilitation system built to modernize correctional facilities through transparency, digital tooling, and robust security.
            </p>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <MotionDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-6">
                    <Building className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Facility Administration</h3>
                <p className="text-muted-foreground leading-relaxed">
                    We replace outdated paperwork with digital ledgers, capacity tracking, and streamlined incident reporting to reduce administrative overhead.
                </p>
            </MotionDiv>
            
            <MotionDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center mb-6">
                    <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Rehabilitation First</h3>
                <p className="text-muted-foreground leading-relaxed">
                    By providing inmates with digital kiosks for self-service requests and commissary purchases, we foster independence and lower friction.
                </p>
            </MotionDiv>

            <MotionDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center mb-6">
                    <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Modern Infrastructure</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Built on bleeding-edge web technologies, Sentinell ensures 99.9% uptime, real-time data synchronization, and absolute reliability.
                </p>
            </MotionDiv>
        </div>

      </main>
    </div>
  );
}
