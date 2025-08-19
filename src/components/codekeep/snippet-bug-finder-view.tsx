
"use client"

import { useState } from 'react';
import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bug, Snippet } from '@/lib/data';
import { findBugs } from '@/ai/flows/find-bugs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';

interface SnippetBugFinderViewProps {
  snippet: Snippet;
}

export function SnippetBugFinderView({ snippet }: SnippetBugFinderViewProps) {
  const [bugs, setBugs] = useState<Bug[] | null>(null);
  const [isFindingBugs, setIsFindingBugs] = useState(false);
  const { toast } = useToast();

  const handleFindBugs = async () => {
    setIsFindingBugs(true);
    setBugs(null);
    try {
      const result = await findBugs({ code: snippet.code, language: snippet.language });
      setBugs(result.bugs);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem finding bugs.',
      });
    } finally {
      setIsFindingBugs(false);
    }
  };

  return (
    <div className="p-4 border rounded-md space-y-4 min-h-[400px]">
      <Button variant="outline" size="sm" onClick={handleFindBugs} disabled={isFindingBugs}>
        {isFindingBugs ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <AlertTriangle className="h-4 w-4 mr-2" />
        )}
        {bugs ? 'Scan Again' : 'Find Bugs'}
      </Button>
      {isFindingBugs && <div className="text-sm text-muted-foreground mt-4 flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {bugs && bugs.length === 0 && (
        <Alert className="mt-4">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>No Bugs Found!</AlertTitle>
          <AlertDescription>
            The AI assistant did not find any obvious bugs in this snippet.
          </AlertDescription>
        </Alert>
      )}
      {bugs && bugs.length > 0 && (
        <ScrollArea className="mt-4 h-[300px] space-y-4">
          <div className="space-y-4 pr-4">
            {bugs.map((bug, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Line {bug.line}: {bug.bug}</AlertTitle>
                <AlertDescription>{bug.suggestion}</AlertDescription>
              </Alert>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
