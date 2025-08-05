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

export function MainLayout({ initialSnippets }: { initialSnippets: Snippet[] }) {
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
    setSelectedSnippet(null); // Close the view dialog
  }

  const onSnippetAdded = () => {
    setAddDialogOpen(false);
    refetchData();
  }
  
  const onSnippetUpdated = () => {
    setEditDialogOpen(false);
    refetchData();
    if (snippetToEdit) {
      startTransition(async () => {
        const newSnippets = await getSnippets();
        setSnippets(newSnippets);
        const updatedSnippet = newSnippets.find((s: Snippet) => s._id === snippetToEdit._id);
        if (updatedSnippet) {
          setSelectedSnippet(updatedSnippet);
        }
        setSnippetToEdit(null);
      });
    }
  }

  const onSnippetSaved = () => {
    setSelectedSnippet(null);
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
              <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
                  <div className="max-w-4xl mx-auto text-center">
                      <Card className="bg-card/50 border-dashed">
                          <CardHeader>
                              <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Welcome to CodeLocker</CardTitle>
                          </CardHeader>
                          <CardContent className="text-muted-foreground space-y-8">
                              <p className="max-w-2xl mx-auto">
                                  Your personal AI-powered snippet manager. Store, search, and organize your code effortlessly.
                                  Choose a snippet from the list to view its code, or add a new one.
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                  <div className="flex items-start gap-4">
                                      <Sparkles className="w-8 h-8 text-primary flex-shrink-0" />
                                      <div>
                                          <h3 className="font-semibold">AI-Assisted Creation</h3>
                                          <p className="text-sm text-muted-foreground">Automatically generate names, descriptions, and tags for your snippets.</p>
                                      </div>
                                  </div>
                                  <div className="flex items-start gap-4">
                                      <FolderKanban className="w-8 h-8 text-primary flex-shrink-0" />
                                      <div>
                                          <h3 className="font-semibold">Easy Organization</h3>
                                          <p className="text-sm text-muted-foreground">Categorize snippets by language and tags for quick retrieval.</p>
                                      </div>
                                  </div>
                                  <div className="flex items-start gap-4">
                                      <Search className="w-8 h-8 text-primary flex-shrink-0" />
                                      <div>
                                          <h3 className="font-semibold">Powerful Search</h3>
                                          <p className="text-sm text-muted-foreground">Instantly find snippets by name, content, or tags.</p>
                                      </div>
                                  </div>
                              </div>
                              <div>
                                  <Button onClick={handleAddSnippet}>
                                      <Plus className="mr-2" />
                                      Add Your First Snippet
                                  </Button>
                              </div>
                          </CardContent>
                      </Card>
                  </div>
              </div>
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

      <Dialog open={!!selectedSnippet} onOpenChange={(open) => { if (!open) setSelectedSnippet(null); }}>
          <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
              {selectedSnippet && (
                  <SnippetView
                      snippet={selectedSnippet}
                      onEdit={() => handleEditRequest(selectedSnippet)}
                      onDelete={() => {
                        setSelectedSnippet(null);
                        handleDeleteRequest(selectedSnippet._id);
                      }}
                      onSave={onSnippetSaved}
                  />
              )}
          </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
