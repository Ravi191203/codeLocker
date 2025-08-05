"use client";

import type { Snippet } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { FileCode } from 'lucide-react';

interface SnippetListProps {
  snippets: Snippet[];
  selectedSnippetId: string | null;
  onSelectSnippet: (id: string) => void;
}

export function SnippetList({
  snippets,
  selectedSnippetId,
  onSelectSnippet,
}: SnippetListProps) {
  if (snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <FileCode className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-semibold">No Snippets Found</h3>
        <p className="text-sm">Try a different search term or add a new snippet.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-2">
        {snippets.map((snippet) => (
          <Card
            key={snippet._id}
            onClick={() => onSelectSnippet(snippet._id)}
            className={cn(
              'cursor-pointer transition-colors hover:bg-accent/10',
              selectedSnippetId === snippet._id
                ? 'bg-accent/20 border-accent'
                : 'border-transparent'
            )}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base font-semibold">{snippet.name}</CardTitle>
              <CardDescription className="text-xs truncate">{snippet.description}</CardDescription>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary" className="text-xs">{snippet.language}</Badge>
                {snippet.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
