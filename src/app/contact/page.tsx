'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="container mx-auto max-w-4xl pt-20">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Get in touch with the Sentinell Systems team for inquiries, support, or implementation requests.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Email</h3>
                        <p className="text-muted-foreground">contact@sentinell.system</p>
                        <p className="text-muted-foreground">support@sentinell.system</p>
                    </div>
                </div>
                
                 <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                    <Phone className="w-6 h-6 text-primary mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Phone</h3>
                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                        <p className="text-muted-foreground">Mon-Fri, 9am - 5pm EST</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                    <MapPin className="w-6 h-6 text-primary mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Headquarters</h3>
                        <p className="text-muted-foreground">
                            123 Innovation Drive<br/>
                            Tech Valley, CA 94043
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-3xl bg-secondary/20 border border-white/5">
                <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">First Name</label>
                            <input className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium ml-1">Last Name</label>
                            <input className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all" placeholder="Doe" />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-sm font-medium ml-1">Email</label>
                        <input type="email" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                         <label className="text-sm font-medium ml-1">Message</label>
                        <textarea className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all min-h-[120px]" placeholder="How can we help you?" />
                    </div>
                    <button className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
