
"use client";

import React, { useEffect, useState } from 'react';
import { Code2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { getSession, logout } from '@/app/actions';
import { Button } from '../ui/button';

export function MainLayout({ children }: { children?: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSession().then(s => {
      setSession(s);
      setIsLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    setSession(null);
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex items-center justify-between gap-4 p-4 border-b">
             <Link href="/" className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                <Code2 />
                CodeKeep
             </Link>
             <div className="flex items-center gap-2">
                {!isLoading && (
                    session ? (
                        <>
                            <span className="text-sm text-muted-foreground">Welcome, {session.user.email}</span>
                             <form action={handleLogout}>
                                <Button variant="outline" size="sm" type="submit">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </>
                    )
                )}
             </div>
        </header>

        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </div>
    </>
  );
}
