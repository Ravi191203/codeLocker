"use client";

import type { Snippet } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { FileCode, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface SnippetListProps {
  snippets: Snippet[];
  onSelectSnippet: (snippet: Snippet) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

export function SnippetList({
  snippets,
  onSelectSnippet,
  onEdit,
  onDelete
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {snippets.map((snippet) => (
        <Card
          key={snippet._id}
          className="flex flex-col cursor-pointer transition-all hover:shadow-lg"
        >
          <CardHeader className="flex-row items-start justify-between gap-4 p-4">
            <div onClick={() => onSelectSnippet(snippet)} className="flex-1">
              <CardTitle className="text-base font-semibold">{snippet.name}</CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2">{snippet.description}</CardDescription>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(snippet)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(snippet._id)} className="text-destructive">
                     <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-grow" onClick={() => onSelectSnippet(snippet)}>
              <div className="bg-muted/50 rounded-md p-2 text-xs font-mono text-muted-foreground line-clamp-4">
                {snippet.code}
              </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
             <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{snippet.language}</Badge>
                {snippet.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
