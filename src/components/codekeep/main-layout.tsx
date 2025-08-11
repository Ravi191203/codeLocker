"use client";

import React, { useState, useMemo, useEffect, useTransition } from 'react';
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
import { Code2, Plus, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { SnippetView } from './snippet-view';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { languages } from '@/lib/data';
import { SnippetList } from './snippet-list';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function MainLayout({ initialSnippets, children }: { initialSnippets: Snippet[], children?: React.ReactNode }) {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [languageFilter, setLanguageFilter] = useState('all');
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
    // This effect extracts the snippet ID from the URL
    // It allows linking directly to a snippet view
    const pathParts = pathname.split('/');
    if (pathname.startsWith('/dashboard/snippet/') && pathParts.length === 4) {
      setSelectedSnippetId(pathParts[3]);
    } else {
      setSelectedSnippetId(null);
    }
  }, [pathname]);

  const filteredSnippets = useMemo(() => {
    return snippets
      .filter((snippet) => {
        const lowerSearch = searchTerm.toLowerCase();
        const languageMatch = languageFilter === 'all' || snippet.language === languageFilter;
        const searchMatch = (
          snippet.name.toLowerCase().includes(lowerSearch) ||
          snippet.code.toLowerCase().includes(lowerSearch) ||
          (snippet.description && snippet.description.toLowerCase().includes(lowerSearch)) ||
          snippet.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
        );
        return languageMatch && searchMatch;
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
  }, [snippets, searchTerm, sortOption, languageFilter]);

  const handleSelectSnippet = (snippet: Snippet) => {
    router.push(`/dashboard/snippet/${snippet._id}`);
  };
  
  const handleDeselectSnippet = () => {
    router.push('/dashboard');
  }

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
          if (selectedSnippetId === snippetToDelete) {
              handleDeselectSnippet();
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
    refetchData();
    setSnippetToEdit(null);
  }

  const onSnippetSaved = () => {
    refetchData();
  };
  
  const selectedSnippet = useMemo(() => {
    if (!selectedSnippetId) return null;
    const snippet = snippets.find(s => s._id === selectedSnippetId);
    // If the snippet isn't in the list but we have an ID, it might be loading.
    // Return a temporary object to prevent errors, or null if loading is done.
    if (!snippet && isPending) return { _id: selectedSnippetId, name: "Loading...", code: "", language: "", tags: [], description: "" } as Snippet;
    return snippet || null;
  }, [selectedSnippetId, snippets, isPending]);

  const renderContent = () => {
    // If a snippet is selected, always show the detail view
    if (selectedSnippet) {
       return <SnippetView
            snippet={selectedSnippet}
            onEdit={() => handleEditRequest(selectedSnippet)}
            onDelete={() => handleDeleteRequest(selectedSnippet._id)}
            onSave={onSnippetSaved}
            onBack={handleDeselectSnippet}
        />
    }

    // On specific dashboard child pages like /extension, render them
    if (pathname !== '/dashboard' && !pathname.startsWith('/dashboard/snippet/')) {
      return <>{children}</>;
    }
    
    // Default dashboard view: show the list
    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">My Snippets</h2>
                <div className="flex items-center gap-2">
                     <Select value={languageFilter} onValueChange={setLanguageFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Languages</SelectItem>
                            {languages.map(lang => (
                                <SelectItem key={lang} value={lang} className="capitalize">{lang}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="a-z">A-Z</SelectItem>
                            <SelectItem value="z-a">Z-A</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <SnippetList 
                snippets={filteredSnippets} 
                onSelectSnippet={handleSelectSnippet}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
            />
        </div>
    )
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
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search snippets by name, content, or tag..."
                        className="pl-9 bg-muted/50 focus:bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
             </div>
             <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/extension">VS Code</Link>
                </Button>
                <Button
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handleAddSnippet}
                    >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>New Snippet</span>
                </Button>
             </div>
        </header>

        <main className="flex-1 overflow-y-auto">
            {isPending && !selectedSnippetId ? <div className="p-8">Loading snippets...</div> : renderContent()}
        </main>
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
    </>
  );
}
