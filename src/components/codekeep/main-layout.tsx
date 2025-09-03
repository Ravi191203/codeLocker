
"use client";

import React from 'react';
import { Code2 } from 'lucide-react';
import Link from 'next/link';

export function MainLayout({ children }: { children?: React.ReactNode }) {

  return (
    <>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex items-center justify-between gap-4 p-4 border-b">
             <Link href="/" className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                <Code2 />
                CodeKeep
             </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </div>
    </>
  );
}
