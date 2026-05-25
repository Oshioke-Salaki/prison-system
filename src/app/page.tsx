// @ts-nocheck
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Activity, Database, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <StatSection />
      <CTASection />
      <Footer />
    </div>
  );
}

const MotionNav = motion.nav as any;
const MotionDiv = motion.div as any;

function Navbar() {
  return (
    <MotionNav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Sentinell<span className="text-primary">.</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/security" className="hover:text-white transition-colors">Security</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:flex px-4 py-2 text-sm font-medium text-white hover:text-primary transition-colors">
            Log In
          </Link>

          <Link href="/contact" className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </MotionNav>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="container mx-auto text-center relative z-10 max-w-4xl">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-primary mb-6">
            REDEFINING CORRECTIONAL MANAGEMENT
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            The Future of <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
              Inmate Rehabilitation.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, secure, and humane digital platform designed to streamline prison administration and enhance inmate welfare through technology.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group">
              Access Platform
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="#demo" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all">
              View Demo
            </Link>
          </div>
        </MotionDiv>
      </div>

    </section>
  );
}

function FeatureSection() {
  const features = [
    {
      title: "Digital Inmate Management",
      description: "Secure biodata, sentence tracking, and behavior logs in one central digital registry.",
      icon: Database
    },
    {
      title: "Kiosk Request System",
      description: "Allow inmates to submit digital requests for medical, food, and education services.",
      icon: Activity
    },
    {
      title: "Financial Integrity",
      description: "Cashless digital wallets for inmates with full transaction oversight and reporting.",
      icon: Lock
    },
    {
      title: "Security & Auditing",
      description: "Role-based access control with immutable activity logging for maximum accountability.",
      icon: Shield
    }
  ];

  return (
    <section id="features" className="py-32 px-6 bg-secondary/20">
      <div className="container mx-auto">
        <div id="security" className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Designed for Modern Corrections</h2>
          <p className="text-muted-foreground text-lg">
            Empowering staff and inmates with tools that promote efficiency, transparency, and rehabilitation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <MotionDiv
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatSection() {
  return (
    <section className="py-24 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Efficiency Increase", value: "40%" },
            { label: "Paperwork Reduced", value: "95%" },
            { label: "Processing Time", value: "< 2m" },
            { label: "Uptime", value: "99.9%" }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-32 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="rounded-3xl bg-gradient-to-b from-primary/20 to-primary/5 border border-white/10 p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-primary/20 blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Modernize?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Deploy the Sentinell system today and transform your facility's operational capabilities.
            </p>
            <Link href="/checklist" className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
              Start Implementation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="about" className="py-12 px-6 border-t border-white/10 bg-black">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-500" />
          <span className="font-semibold text-gray-500">Sentinell Systems</span>
        </div>
        <div className="text-sm text-gray-600">
          © 2026 Smart Prison Systems. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
