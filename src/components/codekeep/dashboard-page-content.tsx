
"use client"

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteSnippet } from '@/app/actions';
import { SnippetList } from '@/components/codekeep/snippet-list';
import { languages, type Snippet } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { AddSnippetForm } from './add-snippet-form';
import { SnippetView } from './snippet-view';
import { getSnippetVersions, getFilteredSnippets, getSnippetById } from '@/app/actions';
import type { SnippetVersion } from '@/lib/data';
import { SnippetHistoryView } from './snippet-history-view';

function SearchAndFilterControls() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const sortOption = searchParams.get('sort') || 'newest';
    const languageFilter = searchParams.get('lang') || 'all';
    const searchTerm = searchParams.get('q') || '';
    
    // Debounce handler
    let timeoutId: NodeJS.Timeout;
    const handleDebouncedSearch = (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            handleFilterChange('q', value);
        }, 300); // 300ms debounce
    }

    const handleFilterChange = (type: 'sort' | 'lang' | 'q', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === 'all') {
            params.delete(type);
        } else {
            params.set(type, value);
        }
        router.push(`/?${params.toString()}`);
    }

    return (
        <>
            <div className="w-full flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search snippets by name, content, or tag..."
                        className="pl-9 w-full bg-muted/50 focus:bg-background"
                        defaultValue={searchTerm}
                        onChange={(e) => handleDebouncedSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
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
        </>
    )
}


export default function DashboardPageContent({ initialSnippets }: { initialSnippets: Snippet[] }) {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snippetToEdit, setSnippetToEdit] = useState<Snippet | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewedSnippet, setViewedSnippet] = useState<Snippet | null>(null);
  const [viewedSnippetVersions, setViewedSnippetVersions] = useState<SnippetVersion[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  useEffect(() => {
    setSnippets(initialSnippets);
  }, [initialSnippets]);

  // Effect to handle opening snippet from URL param
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      const snippetToView = initialSnippets.find(s => s._id === viewId);
      if (snippetToView) {
        handleSelectSnippet(snippetToView);
      } else {
        // If not in initial snippets, fetch it
        startTransition(async () => {
          const snippet = await getSnippetById(viewId);
          if (snippet) handleSelectSnippet(snippet);
        });
      }
    } else {
      setViewedSnippet(null);
    }
  }, [searchParams, initialSnippets]);


  const refreshSnippets = () => {
    startTransition(async () => {
        const dbSnippets = await getFilteredSnippets({
            query: searchParams.get('q') || '',
            language: searchParams.get('lang') || 'all',
            sort: searchParams.get('sort') || 'newest'
        });
        setSnippets(dbSnippets);
    });
  }

  const handleSelectSnippet = async (snippet: Snippet) => {
    setViewedSnippet(snippet);
    const versions = await getSnippetVersions(snippet._id);
    setViewedSnippetVersions(versions);
    // Update URL without navigating
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', snippet._id);
    router.replace(`/?${params.toString()}`);
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
          refreshSnippets();
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not delete the snippet.",
          });
        } finally {
            setDeleteDialogOpen(false);
            setSnippetToDelete(null);
            if (viewedSnippet?._id === snippetToDelete) {
                closeSnippetView();
            }
        }
      });
    }
  };
  
  const handleEditRequest = (snippet: Snippet) => {
    setSnippetToEdit(snippet);
    setEditDialogOpen(true);
  }
  
  const handleHistoryRequest = (snippet: Snippet) => {
    setViewedSnippet(snippet); // Ensure we have the right snippet context
    setHistoryDialogOpen(true);
  };


  const onSnippetUpdated = () => {
    setEditDialogOpen(false);
    refreshSnippets();
    // Also update the viewed snippet if it's the one being edited
    if (viewedSnippet && snippetToEdit && viewedSnippet._id === snippetToEdit._id) {
        // Snippet data will be stale, so let's close the view and let user reopen
        closeSnippetView();
    }
    setSnippetToEdit(null);
  }

  const onSnippetAdded = () => {
    setAddDialogOpen(false);
    toast({
        title: "Snippet created!",
        description: "Your new snippet has been saved successfully.",
    });
    refreshSnippets();
  }

  const closeSnippetView = () => {
    setViewedSnippet(null);
    setViewedSnippetVersions([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('view');
    router.replace(`/?${params.toString()}`);
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <Suspense>
                <SearchAndFilterControls />
            </Suspense>
            <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setAddDialogOpen(true)}
                >
                <Plus className="mr-2 h-4 w-4" />
                <span>New Snippet</span>
            </Button>
        </div>
         <SnippetList 
            snippets={snippets} 
            loading={isPending}
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
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-6">
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

      <Dialog open={!!viewedSnippet} onOpenChange={(open) => {
        if (!open) {
          closeSnippetView();
        }
      }}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
            {viewedSnippet && (
                <SnippetView 
                    snippet={viewedSnippet} 
                    onClose={closeSnippetView}
                    onEdit={handleEditRequest}
                    onDeleteRequest={handleDeleteRequest}
                    onHistoryRequest={handleHistoryRequest}
                />
            )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6">
                <DialogTitle>Version History</DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6 flex-1 min-h-0">
              {viewedSnippet && (
                  <SnippetHistoryView 
                      snippet={viewedSnippet} 
                      initialVersions={viewedSnippetVersions}
                      onSnippetUpdated={() => {
                        refreshSnippets();
                        closeSnippetView();
                        setHistoryDialogOpen(false);
                      }}
                  />
              )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
