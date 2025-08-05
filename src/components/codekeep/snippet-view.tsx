"use client";

import type { Snippet } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './code-block';
import { Pencil, Trash2, Code2 } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '../ui/card';
import { DialogHeader, DialogTitle } from '../ui/dialog';

interface SnippetViewProps {
  snippet: Snippet | undefined;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SnippetView({ snippet, onEdit, onDelete }: SnippetViewProps) {
  if (!snippet) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <Code2 size={48} className="mx-auto" />
          <h2 className="mt-4 text-xl font-medium">Select a snippet</h2>
          <p className="text-sm">Choose a snippet from the list to view its code, or add a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
       <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between border-b p-4 h-16">
        <div>
          <DialogTitle className="text-lg">{snippet.name}</DialogTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(snippet._id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit Snippet</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(snippet._id)} className="hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
             <span className="sr-only">Delete Snippet</span>
          </Button>
        </div>
      </DialogHeader>
      <div className="p-4 flex-grow overflow-y-auto space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{snippet.description}</p>
        </div>

        <div>
           <h3 className="font-semibold text-sm mb-2">Language & Tags</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">{snippet.language}</Badge>
            {snippet.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex-grow flex flex-col min-h-[200px]">
           <h3 className="font-semibold text-sm mb-2">Code</h3>
           <div className="h-full max-h-[calc(90vh-300px)]">
             <CodeBlock code={snippet.code} language={snippet.language} className="h-full" />
           </div>
        </div>
      </div>
    </div>
  );
}
