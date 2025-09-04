
"use client"

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFilteredSnippets } from '@/app/actions';
import { SnippetList } from '@/components/codekeep/snippet-list';
import { languages, type Snippet } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddSnippetForm } from './add-snippet-form';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';


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
  const { toast } = useToast();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    setSnippets(initialSnippets);
  }, [initialSnippets]);

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

  const onSnippetAdded = () => {
    setAddDialogOpen(false);
    toast({
        title: "Snippet created!",
        description: "Your new snippet has been saved successfully.",
    });
    refreshSnippets();
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
        />
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
