"use client";

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from './sidebar';
import { SnippetList } from './snippet-list';
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
import { Button } from '../ui/button';
import { PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { getSnippets, deleteSnippet } from '@/app/actions';
import { AddSnippetForm } from './add-snippet-form';
import { EditSnippetForm } from './edit-snippet-form';

export function MainLayout() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [snippetToEdit, setSnippetToEdit] = useState<Snippet | null>(null);
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const dbSnippets = await getSnippets();
      setSnippets(dbSnippets);
    });
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
      });
  }, [snippets, searchTerm]);

  useEffect(() => {
    if (filteredSnippets.length > 0 && !filteredSnippets.find(s => s._id === selectedSnippetId)) {
      setSelectedSnippetId(filteredSnippets[0]._id);
    } else if (filteredSnippets.length === 0) {
      setSelectedSnippetId(null);
    }
  }, [filteredSnippets, selectedSnippetId]);

  const selectedSnippet = useMemo(() => {
    if (!selectedSnippetId) return undefined;
    return snippets.find((s) => s._id === selectedSnippetId);
  }, [selectedSnippetId, snippets]);

  const handleSelectSnippet = (id: string) => {
    setSelectedSnippetId(id);
  };

  const handleDeleteRequest = (id: string) => {
    setSnippetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (snippetToDelete) {
      startTransition(async () => {
        await deleteSnippet(snippetToDelete);
        const dbSnippets = await getSnippets();
        setSnippets(dbSnippets);
        setDeleteDialogOpen(false);
        setSnippetToDelete(null);
      });
    }
  };

  const handleAddSnippet = () => {
    setAddDialogOpen(true);
  };

  const handleEditRequest = (id: string) => {
    const snippet = snippets.find(s => s._id === id);
    if (snippet) {
      setSnippetToEdit(snippet);
      setEditDialogOpen(true);
    }
  }

  const onSnippetAdded = () => {
    setAddDialogOpen(false);
    startTransition(async () => {
      const dbSnippets = await getSnippets();
      setSnippets(dbSnippets);
    });
  }
  
  const onSnippetUpdated = () => {
    setEditDialogOpen(false);
    setSnippetToEdit(null);
    startTransition(async () => {
      const dbSnippets = await getSnippets();
      setSnippets(dbSnippets);
    });
  }

  const MobileSnippetList = () => (
    <Sheet>
       <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden fixed bottom-4 right-4 z-10 shadow-lg">
          <PanelLeft />
        </Button>
       </SheetTrigger>
       <SheetContent side="left" className="p-0 w-80">
        <SnippetList
            snippets={filteredSnippets}
            selectedSnippetId={selectedSnippetId}
            onSelectSnippet={handleSelectSnippet}
        />
       </SheetContent>
    </Sheet>
  )

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar>
          <AppSidebar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            onAddSnippet={handleAddSnippet}
          />
        </Sidebar>
        <SidebarInset className="p-0 m-0 rounded-none shadow-none bg-transparent">
          <div className="flex h-full">
            <div className="hidden md:flex flex-col w-[320px] lg:w-[400px] border-r border-border h-full">
              <div className="p-4 border-b border-border flex items-center gap-2 h-16">
                <SidebarTrigger />
                <h2 className="font-semibold text-lg">Snippets</h2>
              </div>
              <SnippetList
                snippets={filteredSnippets}
                selectedSnippetId={selectedSnippetId}
                onSelectSnippet={handleSelectSnippet}
              />
            </div>
            <main className="flex-1 h-full overflow-y-auto">
              <SnippetView
                snippet={selectedSnippet}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
              />
            </main>
          </div>
        </SidebarInset>
        {isMobile && <MobileSnippetList />}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Snippet</DialogTitle>
          </DialogHeader>
          <AddSnippetForm
            onSuccess={onSnippetAdded}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
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
