
"use client";

import React, { useEffect, useState } from 'react';
import { Code2, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/actions';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';

export function MainLayout({ children }: { children?: React.ReactNode }) {
  const [session, setSession] = useState<{ user: { email: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchSession() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        } else {
          setSession(null);
        }
      } catch (error) {
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, [pathname]); // Refetch session on route change

  const handleLogout = async () => {
    await logout();
    setSession(null);
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between gap-4 p-4 border-b">
           <Link href="/" className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
              <Code2 />
              CodeKeep
           </Link>
           <div className="flex items-center gap-2">
              {isLoading ? (
                  <Loader2 className="animate-spin" />
              ) : session ? (
                  <>
                      <span className="text-sm text-muted-foreground hidden md:inline">Welcome, {session.user.email}</span>
                       <form action={handleLogout}>
                          <Button variant="outline" size="sm" type="submit">
                              <LogOut className="mr-0 md:mr-2 h-4 w-4" />
                              <span className="hidden md:inline">Logout</span>
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
              )}
           </div>
      </header>

      <main className="flex-1 overflow-y-auto">
          {children}
      </main>
    </div>
  );
}
