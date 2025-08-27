
"use client"

import { useEffect, useMemo, useState, useTransition } from 'react';
import { getSnippets, deleteSnippet } from '@/app/actions';
import { SnippetList } from '@/components/codekeep/snippet-list';
import { languages, type Snippet } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { EditSnippetForm } from '@/components/codekeep/edit-snippet-form';
import { useToast } from '@/hooks/use-toast';
import { Suspense } from 'react';

function DashboardPageContent() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [languageFilter, setLanguageFilter] = useState(searchParams.get('lang') || 'all');
  const searchTerm = searchParams.get('q') || '';
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snippetToEdit, setSnippetToEdit] = useState<Snippet | null>(null);


  useEffect(() => {
    startTransition(async () => {
      const dbSnippets = await getSnippets();
      setSnippets(dbSnippets);
    });
  }, []);

  const handleFilterChange = (type: 'sort' | 'lang', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      params.delete(type);
    } else {
      params.set(type, value);
    }
    router.push(`?${params.toString()}`);

    if (type === 'sort') setSortOption(value);
    if (type === 'lang') setLanguageFilter(value);
  }

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
          const dbSnippets = await getSnippets();
          setSnippets(dbSnippets);
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
  
  const handleEditRequest = (snippet: Snippet) => {
    setSnippetToEdit(snippet);
    setEditDialogOpen(true);
  }

  const onSnippetUpdated = () => {
    setEditDialogOpen(false);
    startTransition(async () => {
      const dbSnippets = await getSnippets();
      setSnippets(dbSnippets);
    });
    setSnippetToEdit(null);
  }


  if (isPending && snippets.length === 0) {
    return <div className="p-8">Loading snippets...</div>
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Snippets</h2>
            <div className="flex items-center gap-2">
                 <Select value={languageFilter} onValueChange={(v) => handleFilterChange('lang', v)}>
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
                <Select value={sortOption} onValueChange={(v) => handleFilterChange('sort', v)}>
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  )
}