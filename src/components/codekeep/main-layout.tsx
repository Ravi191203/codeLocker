"use client";

import React, from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddSnippetForm } from './add-snippet-form';
import { Code2, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function MainLayout({ children }: { children?: React.ReactNode }) {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onSnippetAdded = () => {
    setAddDialogOpen(false);
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
             <Link href="/" className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                <Code2 />
                CodeKeep
             </Link>
             <div className="flex items-center gap-2">
                <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
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
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-6">
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
