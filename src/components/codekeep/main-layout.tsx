
"use client";

import React, { useEffect, useState } from 'react';
import { Code2, LogOut, Loader2, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/actions';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


type UserSession = {
  name: string;
  email: string;
  profilePhotoUrl?: string;
}

export function MainLayout({ children }: { children?: React.ReactNode }) {
  const [session, setSession] = useState<{ user: UserSession } | null>(null);
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
           <div className="flex items-center gap-4">
              {isLoading ? (
                  <Loader2 className="animate-spin" />
              ) : session ? (
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={session.user.profilePhotoUrl} alt={session.user.name} />
                                <AvatarFallback>{session.user.name?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline">{session.user.name}</span>
                            <ChevronDown className="h-4 w-4" />
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/profile">
                          <DropdownMenuItem>
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem disabled>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
