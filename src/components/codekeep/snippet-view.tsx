

"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Snippet, SnippetVersion } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './code-block';
import { Pencil, Trash2, History, Share2, Copy, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { updateSnippetSharing, deleteSnippet } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useRouter } from 'next/navigation';
import { EditSnippetForm } from './edit-snippet-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LoadingComponent = () => (
    <div className="p-4 border rounded-md min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
);

const SnippetHistoryView = dynamic(() => import('./snippet-history-view').then(mod => mod.SnippetHistoryView), { loading: LoadingComponent });


interface SnippetViewProps {
  snippet: Snippet;
  initialVersions: SnippetVersion[];
}

export function SnippetView({ snippet: initialSnippet, initialVersions }: SnippetViewProps) {
  const [snippet, setSnippet] = useState(initialSnippet);
  const [isSharing, startSharingTransition] = React.useTransition();
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const [hasCopied, setHasCopied] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const router = useRouter();
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

  const handleDeleteConfirm = () => {
    startDeleteTransition(async () => {
      try {
        await deleteSnippet(snippet._id);
        toast({
          title: 'Snippet deleted',
          description: 'The snippet has been permanently deleted.',
        });
        setDeleteDialogOpen(false);
        router.push('/dashboard');
        router.refresh();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Could not delete the snippet.",
        });
      }
    });
  };

  const onSnippetUpdated = () => {
    setEditDialogOpen(false);
    router.refresh();
  }


  const shareUrl = snippet.isPublic && snippet.shareId ? `${window.location.origin}/s/${snippet.shareId}` : '';

  return (
    <>
      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        <header className="space-y-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="pl-0 h-auto p-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to dashboard
          </Button>

          <div className="flex justify-between items-start gap-4">
              <div className='flex-1 space-y-1.5'>
                  <h1 className="text-2xl font-bold leading-none tracking-tight truncate">{snippet.name}</h1>
                  <p className="text-sm text-muted-foreground">{snippet.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
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
              </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">{snippet.language}</Badge>
            {snippet.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <main className="flex-1 space-y-6 overflow-y-auto">
          <Tabs defaultValue="code" className="space-y-4">
            <TabsList className="w-full justify-start md:w-auto overflow-x-auto">
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="code">
              <div className="h-full max-h-[500px] min-h-[300px]">
                <CodeBlock code={snippet.code} language={snippet.language} className="h-full" />
              </div>
            </TabsContent>
            <TabsContent value="history">
                <SnippetHistoryView snippet={snippet} initialVersions={initialVersions} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this snippet from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-6">
            <DialogTitle>Edit Snippet</DialogTitle>
          </DialogHeader>
          <EditSnippetForm
            snippet={snippet}
            onSuccess={onSnippetUpdated}
          />
        </DialogContent>
      </Dialog>
      
    </>
  );
}
