"use client";

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
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

  const refetchSnippets = () => {
     startTransition(async () => {
      const dbSnippets = await getSnippets();
      setSnippets(dbSnippets);
    });
  }

  useEffect(() => {
    if (snippets.length > 0 && !selectedSnippet) {
      setSelectedSnippet(snippets[0]);
    }
     if (snippets.length === 0) {
      setSelectedSnippet(null);
    }
  }, [snippets, selectedSnippet]);
  
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
        await deleteSnippet(snippetToDelete);
        refetchSnippets();
        if (selectedSnippet?._id === snippetToDelete) {
            setSelectedSnippet(null);
        }
        setDeleteDialogOpen(false);
        setSnippetToDelete(null);
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
    refetchSnippets();
  }
  
  const onSnippetUpdated = () => {
    setEditDialogOpen(false);
    setSnippetToEdit(null);
    refetchSnippets();
     if (snippetToEdit) {
        startTransition(async () => {
            const newSnippets = await getSnippets();
            setSnippets(newSnippets);
            const updatedSnippet = newSnippets.find((s: Snippet) => s._id === snippetToEdit._id);
            if (updatedSnippet) {
                setSelectedSnippet(updatedSnippet);
            }
        });
    }
  }

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
            selectedSnippet={selectedSnippet}
          />
        </Sidebar>
        <SidebarInset>
           <main className="flex-1 h-full overflow-y-auto">
              <SnippetView
                snippet={selectedSnippet}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
              />
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
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
