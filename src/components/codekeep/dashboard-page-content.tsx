
"use client"

import { useEffect, useState, useTransition, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SnippetList } from '@/components/codekeep/snippet-list';
import { languages, type Snippet } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddSnippetForm } from './add-snippet-form';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Search, Globe, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// Debounce function
function debounce(func: (...args: any[]) => void, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}


function SearchAndFilterControls() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const sortOption = searchParams.get('sort') || 'newest';
    const languageFilter = searchParams.get('lang') || 'all';
    const searchTerm = searchParams.get('q') || '';

    const handleFilterChange = (type: 'sort' | 'lang' | 'q', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === 'all' || (type === 'q' && value.length < 2)) {
            params.delete(type);
        } else {
            params.set(type, value);
        }
        // Using window.history.pushState to avoid a full page reload,
        // letting the parent component handle the data refetch.
        window.history.pushState(null, '', `?${params.toString()}`);
        // Dispatch a custom event that the parent component can listen to.
        window.dispatchEvent(new Event('filterChange'));
    };

    const debouncedSearch = useCallback(debounce( (value: string) => handleFilterChange('q', value), 300), [searchParams.toString()]);
    
    return (
        <>
            <div className="w-full flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search snippets by name, content, or tag..."
                        className="pl-9 w-full bg-muted/50 focus:bg-background"
                        defaultValue={searchTerm}
                        onChange={(e) => debouncedSearch(e.target.value)}
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


export default function DashboardPageContent() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const refreshSnippets = useCallback(() => {
    startTransition(async () => {
      try {
        const params = new URLSearchParams(searchParams.toString());
        const response = await fetch(`/api/v1/snippets/list?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch snippets');
        const dbSnippets = await response.json();
        setSnippets(dbSnippets);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error fetching snippets',
          description: 'Could not retrieve snippet data.',
        });
      }
    });
  }, [searchParams, toast]);

  useEffect(() => {
    refreshSnippets();

    const handleFilterChange = () => refreshSnippets();
    
    window.addEventListener('filterChange', handleFilterChange);
    
    // Listen for popstate events (back/forward browser buttons)
    window.addEventListener('popstate', handleFilterChange);

    return () => {
      window.removeEventListener('filterChange', handleFilterChange);
      window.removeEventListener('popstate', handleFilterChange);
    };
  }, [refreshSnippets]);


  const onSnippetAdded = () => {
    setAddDialogOpen(false);
    toast({
        title: "Snippet created!",
        description: "Your new snippet has been saved successfully.",
    });
    refreshSnippets();
  }

  const privateSnippets = snippets.filter(s => !s.isPublic);
  const publicSnippets = snippets.filter(s => s.isPublic);

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
        <Tabs defaultValue="private" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="private">
                    <Lock className="mr-2 h-4 w-4" />
                    Private ({privateSnippets.length})
                </TabsTrigger>
                <TabsTrigger value="public">
                    <Globe className="mr-2 h-4 w-4" />
                    Public ({publicSnippets.length})
                </TabsTrigger>
            </TabsList>
            <TabsContent value="private" className="mt-6">
                <SnippetList 
                    snippets={privateSnippets} 
                    loading={isPending}
                />
            </TabsContent>
            <TabsContent value="public" className="mt-6">
                <SnippetList 
                    snippets={publicSnippets} 
                    loading={isPending}
                />
            </TabsContent>
        </Tabs>
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
