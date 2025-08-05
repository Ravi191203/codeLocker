"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Code, FileCode, Plus, Search } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Snippet } from '@/lib/data';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  onAddSnippet: () => void;
  snippets: Snippet[];
  onSelectSnippet: (snippet: Snippet) => void;
  selectedSnippet: Snippet | null;
}

export function AppSidebar({
  searchTerm,
  onSearch,
  onAddSnippet,
  snippets,
  onSelectSnippet,
  selectedSnippet,
}: AppSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-4 space-y-4 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold tracking-tight text-sidebar-primary-foreground">CodeKeep</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            className="pl-9 bg-background/50 focus:bg-background"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
        {snippets.length > 0 ? (
          <ul className="space-y-1">
            {snippets.map(snippet => (
              <li key={snippet._id}>
                <button
                  onClick={() => onSelectSnippet(snippet)}
                  className={cn(
                    "w-full text-left p-2 rounded-md text-sm flex items-start gap-2",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    selectedSnippet?._id === snippet._id && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Code className="w-4 h-4 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">{snippet.name}</p>
                    <p className="text-xs text-muted-foreground">{snippet.language}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-sm text-muted-foreground">
            <FileCode className="w-8 h-8 mx-auto mb-2" />
            <p>No snippets found.</p>
          </div>
        )}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" onClick={onAddSnippet}>
          <Plus className="mr-2 h-4 w-4" />
          New Snippet
        </Button>
      </div>
    </div>
  );
}
