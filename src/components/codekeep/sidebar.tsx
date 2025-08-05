"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface AppSidebarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  onAddSnippet: () => void;
}

export function AppSidebar({
  searchTerm,
  onSearch,
  onAddSnippet,
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

      <ScrollArea className="flex-1" />

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" onClick={onAddSnippet}>
          <Plus className="mr-2 h-4 w-4" />
          New Snippet
        </Button>
      </div>
    </div>
  );
}
