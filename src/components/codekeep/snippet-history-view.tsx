
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { GitCompareArrows, History, Eye, Undo, Loader2 } from 'lucide-react';
import DiffViewer from 'react-diff-viewer-continued';

import { useToast } from '@/hooks/use-toast';
import { getSnippetVersions, restoreSnippetVersion } from '@/app/actions';
import type { Snippet, SnippetVersion } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { CodeBlock } from './code-block';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface SnippetHistoryViewProps {
  snippet: Snippet;
  initialVersions: SnippetVersion[];
}

export function SnippetHistoryView({ snippet, initialVersions }: SnippetHistoryViewProps) {
  const [versions, setVersions] = useState<SnippetVersion[]>(initialVersions);
  const [isFetchingVersions, setIsFetchingVersions] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [viewingVersion, setViewingVersion] = useState<SnippetVersion | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<SnippetVersion[]>([]);
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    handleFetchVersions();
  }, [snippet]);

  const handleFetchVersions = async () => {
    setIsFetchingVersions(true);
    try {
      const result = await getSnippetVersions(snippet._id);
      setVersions(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not fetch version history.',
      });
    } finally {
      setIsFetchingVersions(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    setIsRestoring(versionId);
    try {
      await restoreSnippetVersion(versionId);
      toast({
        title: 'Snippet Restored!',
        description: 'The snippet has been restored to the selected version.',
      });
      setViewingVersion(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not restore the selected version.',
      });
    } finally {
      setIsRestoring(null);
    }
  };

  const handleVersionSelection = (version: SnippetVersion) => {
    setSelectedVersions(prev => {
      const isSelected = prev.some(v => v._id === version._id);
      if (isSelected) {
        return prev.filter(v => v._id !== version._id);
      }
      if (prev.length < 2) {
        return [...prev, version].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      // If already 2 selected, replace the oldest one
       const sorted = [...prev, version].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
       return [sorted[0], sorted[1]];
    });
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      setDiffDialogOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Select Two Versions',
        description: 'Please select exactly two versions to compare.',
      });
    }
  };

  return (
    <>
      <div className="p-4 border rounded-md space-y-4 min-h-[400px]">
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleCompareVersions}
            disabled={selectedVersions.length !== 2}
          >
            <GitCompareArrows className="h-4 w-4 mr-2" />
            Compare Versions
          </Button>
        </div>
        {isFetchingVersions && <div className="text-sm text-muted-foreground mt-4 flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {!isFetchingVersions && versions.length === 0 && (
          <Alert>
            <History className="h-4 w-4" />
            <AlertTitle>No History Found</AlertTitle>
            <AlertDescription>
              There are no saved versions for this snippet yet. Edit and save the snippet to create a version.
            </AlertDescription>
          </Alert>
        )}
        {!isFetchingVersions && versions.length > 0 && (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {versions.map(version => (
                <div key={version._id} className="p-3 rounded-md bg-muted/50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={`version-${version._id}`}
                      checked={selectedVersions.some(v => v._id === version._id)}
                      onCheckedChange={() => handleVersionSelection(version)}
                      disabled={
                        selectedVersions.length >= 2 && !selectedVersions.some(v => v._id === version._id)
                      }
                    />
                    <div>
                      <p className="font-semibold text-sm">{version.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Saved {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingVersion(version)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <Dialog open={!!viewingVersion} onOpenChange={(open) => !open && setViewingVersion(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
          {viewingVersion && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingVersion.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Version saved on {new Date(viewingVersion.createdAt).toLocaleString()}
                </p>
              </DialogHeader>
              <div className="flex-1 min-h-0">
                <CodeBlock code={viewingVersion.code} language={viewingVersion.language} className="h-full" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button
                  onClick={() => handleRestoreVersion(viewingVersion._id)}
                  disabled={isRestoring === viewingVersion._id}
                >
                  {isRestoring === viewingVersion._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo className="h-4 w-4 mr-2" />}
                  Restore this version
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={diffDialogOpen} onOpenChange={setDiffDialogOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Compare Snippet Versions</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {selectedVersions.length === 2 && (
              <DiffViewer
                oldValue={selectedVersions[1].code}
                newValue={selectedVersions[0].code}
                splitView={true}
                leftTitle={`Version from: ${new Date(selectedVersions[1].createdAt).toLocaleString()}`}
                rightTitle={`Version from: ${new Date(selectedVersions[0].createdAt).toLocaleString()}`}
                useDarkTheme={true}
                styles={{
                  variables: {
                    dark: {
                      color: 'hsl(var(--foreground))',
                      background: 'hsl(var(--background))',
                      addedBackground: 'hsl(var(--primary) / 0.2)',
                      addedColor: 'hsl(var(--foreground))',
                      removedBackground: 'hsl(var(--destructive) / 0.2)',
                      removedColor: 'hsl(var(--foreground))',
                      wordAddedBackground: 'hsl(var(--primary) / 0.4)',
                      wordRemovedBackground: 'hsl(var(--destructive) / 0.4)',
                      addedGutterBackground: 'hsl(var(--primary) / 0.1)',
                      removedGutterBackground: 'hsl(var(--destructive) / 0.1)',
                      gutterBackground: 'hsl(var(--muted) / 0.5)',
                      gutterBackgroundDark: 'hsl(var(--muted) / 0.8)',
                      highlightBackground: 'hsl(var(--accent) / 0.2)',
                      highlightGutterBackground: 'hsl(var(--accent) / 0.1)',
                      codeFoldGutterBackground: 'hsl(var(--muted))',
                      codeFoldBackground: 'hsl(var(--muted))',
                      emptyLineBackground: 'hsl(var(--muted) / 0.2)',
                      gutterColor: 'hsl(var(--muted-foreground))',
                      addedGutterColor: 'hsl(var(--foreground))',
                      removedGutterColor: 'hsl(var(--foreground))',
                      codeFoldContentColor: 'hsl(var(--muted-foreground))',
                      diffViewerTitleBackground: 'hsl(var(--card))',
                      diffViewerTitleColor: 'hsl(var(--card-foreground))',
                      diffViewerTitleBorderColor: 'hsl(var(--border))',
                      emptyContentBackground: 'hsl(var(--muted))',
                    },
                  },
                }}
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
