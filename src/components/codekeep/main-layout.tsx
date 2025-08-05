"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from './sidebar';
import { SnippetList } from './snippet-list';
import { SnippetView } from './snippet-view';
import { folders, snippets as allSnippets, type Snippet } from '@/lib/data';
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
import { Button } from '../ui/button';
import { PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

export function MainLayout() {
  const [snippets, setSnippets] = useState<Snippet[]>(allSnippets);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folders[0]?.id || null);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filteredSnippets = useMemo(() => {
    return snippets
      .filter((snippet) => (selectedFolderId ? snippet.folderId === selectedFolderId : true))
      .filter((snippet) => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (
          snippet.name.toLowerCase().includes(lowerSearch) ||
          snippet.code.toLowerCase().includes(lowerSearch) ||
          snippet.description.toLowerCase().includes(lowerSearch) ||
          snippet.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
        );
      });
  }, [snippets, selectedFolderId, searchTerm]);

  useEffect(() => {
    setSelectedSnippetId(filteredSnippets[0]?.id || null);
  }, [filteredSnippets]);

  const selectedSnippet = useMemo(() => {
    if (!selectedSnippetId) return undefined;
    return snippets.find((s) => s.id === selectedSnippetId);
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
      setSnippets((prev) => prev.filter((s) => s.id !== snippetToDelete));
    }
    setDeleteDialogOpen(false);
    setSnippetToDelete(null);
  };

  const handleAddSnippet = () => {
    // This is a placeholder for a real implementation
    console.log('Add new snippet');
  };

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
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
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
                onEdit={() => console.log('Edit snippet')}
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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
