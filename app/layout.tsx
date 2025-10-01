import './globals.css';
import 'react-resizable-panels/styles.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'MEGAMIND ULTRA Orchestrator',
  description: 'Autonomous multi-agent tournament orchestrator for complex tasks.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 bg-secondary/80 backdrop-blur sticky top-0 z-50">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-semibold">MEGAMIND ULTRA</h1>
                <p className="text-sm text-slate-300">
                  Build, evaluate, and iterate on autonomous multi-agent solutions.
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
