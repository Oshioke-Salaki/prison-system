'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Key, ArrowLeft, CheckCircle } from 'lucide-react';

const MotionDiv = motion.div as any;

export default function SecurityPage() {
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
            className="text-center mb-16"
        >
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Enterprise-Grade Security</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sentinell is built on a zero-trust architecture, ensuring that sensitive inmate records, facility data, and staff profiles remain completely secure.
            </p>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-white/10 p-8 rounded-2xl"
            >
                <Key className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">Role-Based Access Control</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Access is strictly limited by role. Officers, Admins, and Inmates each have specialized interfaces that prevent unauthorized access to restricted features.
                </p>
            </MotionDiv>
            
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-white/10 p-8 rounded-2xl"
            >
                <Eye className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold mb-3">Immutable Audit Trails</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Every action, from transaction processing to status updates, is permanently logged and time-stamped. Nothing can be deleted without admin clearance.
                </p>
            </MotionDiv>
        </div>

        <MotionDiv 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-gradient-to-r from-primary/20 to-transparent border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
        >
            <div>
                <h2 className="text-2xl font-bold mb-2">Compliance & Data Privacy</h2>
                <p className="text-muted-foreground">We adhere strictly to international correctional data privacy standards.</p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2 font-medium"><CheckCircle className="w-5 h-5 text-green-500" /> End-to-end Encryption</div>
                <div className="flex items-center gap-2 font-medium"><CheckCircle className="w-5 h-5 text-green-500" /> SOC2 Certified Architecture</div>
            </div>
        </MotionDiv>
      </main>
    </div>
  );
}
