"use client";

import React, { useState, useTransition } from 'react';
import { type Snippet } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSnippets } from '@/app/actions';
import { AddSnippetForm } from './add-snippet-form';
import { Code2, Plus, Search, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Input } from '../ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function MainLayout({ children }: { children?: React.ReactNode }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
          params.set('q', searchTerm);
      } else {
          params.delete('q');
      }
      router.push(`${pathname}?${params.toString()}`);
  }

  const onSnippetAdded = () => {
    setAddDialogOpen(false);
    // Instead of refetching here, we rely on server actions revalidating the path
    // and Next.js router cache to update the UI.
     router.refresh();
      toast({
        title: "Snippet created!",
        description: "Your new snippet has been saved successfully.",
      });
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex items-center justify-between gap-4 p-4 border-b">
             <Link href="/dashboard" className="text-xl font-bold tracking-tight text-accent flex items-center gap-2">
                <Code2 />
                CodeKeep
             </Link>
             <div className="flex-1 max-w-2xl">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                          placeholder="Search snippets by name, content, or tag..."
                          className="pl-9 bg-muted/50 focus:bg-background"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
                </form>
             </div>
             <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/analytics" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                    </Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/extension">VS Code</Link>
                </Button>
                <Button
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => setAddDialogOpen(true)}
                    >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>New Snippet</span>
                </Button>
             </div>
        </header>

        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </div>
      
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Snippet</DialogTitle>
          </DialogHeader>
          <AddSnippetForm
            onSuccess={onSnippetAdded}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
