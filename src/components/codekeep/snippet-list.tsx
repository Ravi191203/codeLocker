

"use client";

import type { Snippet } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { FileCode, Loader2, MoreVertical, Pencil, Trash2, Copy, Check, Globe, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface SnippetListProps {
  snippets: Snippet[];
  loading?: boolean;
}

function SnippetCard({ snippet }: {
  snippet: Snippet;
}) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(snippet.code).then(() => {
      setHasCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    });
  };

  return (
    <Link href={`/snippets/${snippet._id}`} className="flex">
        <Card
        key={snippet._id}
        className="flex flex-col cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 w-full"
        >
        <CardHeader className="flex-row items-start justify-between gap-4 p-4">
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold leading-none">{snippet.name}</CardTitle>
                </div>
                <CardDescription className="text-xs line-clamp-2">{snippet.description}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
            <div className="h-24 overflow-hidden rounded-md bg-muted/50 relative group/code p-2">
            <button
                className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover/code:opacity-100 transition-opacity focus:opacity-100 z-10 p-1 rounded-md hover:bg-background"
                onClick={copyToClipboard}
                aria-label="Copy code"
                >
                {hasCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                ) : (
                    <Copy className="h-4 w-4" />
                )}
                </button>
                <pre className="text-xs font-mono whitespace-pre-wrap overflow-hidden h-full">
                {snippet.code}
                </pre>
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs capitalize">{snippet.language}</Badge>
                {snippet.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
            </div>
        </CardFooter>
        </Card>
    </Link>
  )
}

export function SnippetList({
  snippets,
  loading,
}: SnippetListProps) {

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground p-8">
        <Loader2 className="w-16 h-16 mb-4 animate-spin" />
        <h3 className="text-lg font-semibold">Loading Snippets...</h3>
      </div>
    );
  }
  
  if (snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground p-8 rounded-lg border-dashed border-2">
        <FileCode className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-semibold">No Snippets Found</h3>
        <p className="text-sm">Try a different search term or create a new snippet in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {snippets.map((snippet) => (
        <SnippetCard 
          key={snippet._id}
          snippet={snippet}
        />
      ))}
    </div>
  );
}
