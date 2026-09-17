import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 text-sm border-t border-neutral-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Aceso<span className="text-emerald-500">Shop</span></span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Monitored e-commerce reference application for the AcesoLoop supervised self-healing research project.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Shop Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/search?category=electronics" className="hover:text-white transition">Electronics</Link></li>
              <li><Link href="/search?category=apparel" className="hover:text-white transition">Apparel</Link></li>
              <li><Link href="/search?category=home" className="hover:text-white transition">Home & Kitchen</Link></li>
              <li><Link href="/search?category=books" className="hover:text-white transition">Technical Books</Link></li>
              <li><Link href="/search?category=outdoor" className="hover:text-white transition">Outdoor Gear</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Telemetry Verification</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/api/sentry-smoke" className="hover:text-red-400 text-neutral-400 transition">Sentry Smoke Route (HC-1.2)</Link></li>
              <li><span className="text-neutral-500">PostHog Event Stream: Active</span></li>
              <li><span className="text-neutral-500">Synthetic Traffic Cron: 6/hr</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Project Reference</h4>
            <p className="text-xs text-neutral-400 leading-relaxed mb-2">
              Built under GitHub Organization:
            </p>
            <a
              href="https://github.com/ACESO-Intelligent-Recovery"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium text-xs block"
            >
              ACESO-Intelligent-Recovery →
            </a>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>© 2026 AcesoLoop Project. Built for academic research and evaluated self-healing.</p>
          <div className="flex gap-4">
            <span>Next.js 16</span>
            <span>TypeScript</span>
            <span>Tailwind v4</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
