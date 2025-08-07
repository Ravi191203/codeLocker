"use client";

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from './sidebar';
import { SnippetView } from './snippet-view';
import { type Snippet } from '@/lib/data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSnippets, deleteSnippet } from '@/app/actions';
import { AddSnippetForm } from './add-snippet-form';
import { EditSnippetForm } from './edit-snippet-form';
import { Menu, Plus, Sparkles, FolderKanban, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';


export function MainLayout({ initialSnippets, children }: { initialSnippets: Snippet[], children?: React.ReactNode }) {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [snippetToEdit, setSnippetToEdit] = useState<Snippet | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();


  const refetchData = () => {
     startTransition(async () => {
      const dbSnippets = await getSnippets();
      setSnippets(dbSnippets);
    });
  }

  useEffect(() => {
    refetchData();
  }, []);

  const filteredSnippets = useMemo(() => {
    return snippets
      .filter((snippet) => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (
          snippet.name.toLowerCase().includes(lowerSearch) ||
          snippet.code.toLowerCase().includes(lowerSearch) ||
          (snippet.description && snippet.description.toLowerCase().includes(lowerSearch)) ||
          snippet.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
        );
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'a-z':
            return a.name.localeCompare(b.name);
          case 'z-a':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
  }, [snippets, searchTerm, sortOption]);

  const handleSelectSnippet = (snippet: Snippet) => {
    setSelectedSnippet(snippet);
    if(pathname !== '/') {
        router.push('/');
    }
  };

  const handleDeleteRequest = (id: string) => {
    setSnippetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (snippetToDelete) {
      startTransition(async () => {
        try {
          await deleteSnippet(snippetToDelete);
          toast({
            title: 'Snippet deleted',
            description: 'The snippet has been permanently deleted.',
          });
          refetchData();
          if (selectedSnippet?._id === snippetToDelete) {
              setSelectedSnippet(null);
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not delete the snippet.",
          });
        } finally {
            setDeleteDialogOpen(false);
            setSnippetToDelete(null);
        }
      });
    }
  };

  const handleAddSnippet = () => {
    setAddDialogOpen(true);
  };

  const handleEditRequest = (snippet: Snippet) => {
    setSnippetToEdit(snippet);
    setEditDialogOpen(true);
  }

  const onSnippetAdded = () => {
    setAddDialogOpen(false);
    refetchData();
  }
  
  const onSnippetUpdated = () => {
    setEditDialogOpen(false);
    startTransition(async () => {
      const newSnippets = await getSnippets();
      setSnippets(newSnippets);
      if (snippetToEdit) {
        const updatedSnippet = newSnippets.find((s: Snippet) => s._id === snippetToEdit._id);
        if (updatedSnippet) {
          setSelectedSnippet(updatedSnippet);
        }
      }
      setSnippetToEdit(null);
    });
  }

  const onSnippetSaved = () => {
    refetchData();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar>
          <AppSidebar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onAddSnippet={handleAddSnippet}
            snippets={filteredSnippets}
            onSelectSnippet={handleSelectSnippet}
            selectedSnippetId={selectedSnippet?._id || null}
          />
        </Sidebar>
        <SidebarInset>
           <main className="flex-1 h-full overflow-y-auto flex flex-col">
              <div className="p-2 border-b">
                <Button variant="ghost" size="icon" asChild>
                  <SidebarTrigger>
                    <Menu />
                  </SidebarTrigger>
                </Button>
              </div>
              {selectedSnippet && pathname === '/' ? (
                 <div className="flex-1 flex flex-col h-full">
                    <SnippetView
                        snippet={selectedSnippet}
                        onEdit={() => handleEditRequest(selectedSnippet)}
                        onDelete={() => handleDeleteRequest(selectedSnippet._id)}
                        onSave={onSnippetSaved}
                    />
                 </div>
              ) : (
                <div className="flex-1 p-4 md:p-8">
                    {children}
                </div>
              )}
            </main>
        </SidebarInset>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this snippet from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
      
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) setSnippetToEdit(null);
        setEditDialogOpen(open);
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Snippet</DialogTitle>
          </DialogHeader>
          {snippetToEdit && (
            <EditSnippetForm
              snippet={snippetToEdit}
              onSuccess={onSnippetUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

    </SidebarProvider>
  );
}
