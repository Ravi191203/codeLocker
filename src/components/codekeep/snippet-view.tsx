"use client";

import type { Snippet } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './code-block';
import { Pencil, Trash2, Code2 } from 'lucide-react';

interface SnippetViewProps {
  snippet: Snippet | null;
  onEdit: (snippet: Snippet) => void;
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
       <header className="flex-shrink-0 border-b p-4 h-16 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{snippet.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(snippet)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(snippet._id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </header>
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
           <div className="h-full max-h-[calc(100vh - 300px)]">
             <CodeBlock code={snippet.code} language={snippet.language} className="h-full" />
           </div>
        </div>
      </div>
    </div>
  );
}
