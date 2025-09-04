
"use client";

import React, { useState, useEffect } from 'react';
import type { Snippet } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './code-block';
import { Pencil, Trash2, History, Share2, Copy, Check, X, Loader2 } from 'lucide-react';
import { updateSnippetSharing } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';

interface SnippetViewProps {
  snippet: Snippet;
  onClose: () => void;
  onEdit: (snippet: Snippet) => void;
  onDeleteRequest: (id: string) => void;
  onHistoryRequest: (snippet: Snippet) => void;
}

export function SnippetView({ snippet: initialSnippet, onClose, onEdit, onDeleteRequest, onHistoryRequest }: SnippetViewProps) {
  const [snippet, setSnippet] = useState(initialSnippet);
  const [isSharing, startSharingTransition] = React.useTransition();
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setSnippet(initialSnippet);
  }, [initialSnippet]);

  if (!snippet) {
    return null;
  }
  
  const handleSharingChange = (isPublic: boolean) => {
    startSharingTransition(async () => {
        try {
            const updatedSnippet = await updateSnippetSharing(snippet._id, isPublic);
            setSnippet(updatedSnippet);
            toast({
                title: isPublic ? 'Sharing Enabled' : 'Sharing Disabled',
                description: isPublic ? 'Your snippet is now public.' : 'Your snippet is now private.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'Could not update sharing settings.',
            });
        }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    });
  };

  const shareUrl = snippet.isPublic && snippet.shareId ? `${window.location.origin}/s/${snippet.shareId}` : '';

  return (
    <>
        <header className="p-4 border-b flex-shrink-0">
          <div className="flex justify-between items-start gap-4">
              <div className='flex-1 space-y-1.5'>
                  <h2 className="text-2xl font-bold leading-none tracking-tight truncate">{snippet.name}</h2>
                  <p className="text-sm text-muted-foreground">{snippet.description}</p>
                   <div className="flex flex-wrap items-center gap-2 pt-2">
                        <Badge variant="secondary" className="capitalize">{snippet.language}</Badge>
                        {snippet.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                            {tag}
                        </Badge>
                        ))}
                    </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(snippet)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => onHistoryRequest(snippet)}>
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDeleteRequest(snippet._id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                  <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96">
                  <div className="grid gap-4">
                      <div className="space-y-2">
                      <h4 className="font-medium leading-none">Share Snippet</h4>
                      <p className="text-sm text-muted-foreground">
                          Anyone with the link can view this snippet.
                      </p>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Switch
                              id="sharing-switch"
                              checked={snippet.isPublic}
                              onCheckedChange={handleSharingChange}
                              disabled={isSharing}
                          />
                          <Label htmlFor="sharing-switch">{isSharing ? 'Updating...' : (snippet.isPublic ? 'Sharing is On' : 'Sharing is Off')}</Label>
                      </div>
                      {snippet.isPublic && shareUrl && (
                      <div className="space-y-2">
                          <Label htmlFor="link">Public Link</Label>
                          <div className="flex items-center gap-2">
                              <Input id="link" value={shareUrl} readOnly className="h-8" />
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(shareUrl)}>
                                  {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              </Button>
                          </div>
                      </div>
                      )}
                  </div>
                  </PopoverContent>
                </Popover>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </Button>
              </div>
          </div>
        </header>

        <main className="flex-1 min-h-0">
          <CodeBlock code={snippet.code} language={snippet.language} className="h-full" />
        </main>
    </>
  );
}
