
"use client"

import { useState } from 'react';
import { Loader2, Wand2, Sparkles } from 'lucide-react';
import DiffViewer from 'react-diff-viewer-continued';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type Snippet } from '@/lib/data';
import {
  refactorCode,
  type RefactorCodeOutput,
} from '@/ai/flows/refactor-code';
import ReactMarkdown from 'react-markdown';

const refactorGoals = {
  readability: 'Improve Readability',
  performance: 'Optimize Performance',
  maintainability: 'Increase Maintainability',
  'best-practices': 'Apply Best Practices',
  modernize: 'Modernize Syntax',
};
type RefactorGoal = keyof typeof refactorGoals;

interface SnippetRefactorViewProps {
  snippet: Snippet;
}

export function SnippetRefactorView({ snippet }: SnippetRefactorViewProps) {
  const [result, setResult] = useState<RefactorCodeOutput | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [goal, setGoal] = useState<RefactorGoal>('readability');
  const { toast } = useToast();

  const handleRefactorCode = async () => {
    setIsRefactoring(true);
    setResult(null);
    try {
      const response = await refactorCode({
        code: snippet.code,
        language: snippet.language,
        goal,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem refactoring the code.',
      });
    } finally {
      setIsRefactoring(false);
    }
  };

  return (
    <div className="p-4 border rounded-md space-y-4 min-h-[400px]">
      <div className="flex items-center gap-2">
        <Select
          onValueChange={(value) => setGoal(value as RefactorGoal)}
          defaultValue={goal}
        >
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Select refactoring goal" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(refactorGoals).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefactorCode}
          disabled={isRefactoring}
        >
          {isRefactoring ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Refactor
        </Button>
      </div>

      {isRefactoring && (
        <div className="text-sm text-muted-foreground mt-4 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="h-full max-h-[500px] overflow-auto">
            <DiffViewer
                oldValue={snippet.code}
                newValue={result.refactoredCode}
                splitView={true}
                leftTitle="Original Code"
                rightTitle="Refactored Code"
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
          </div>
           <div className="prose prose-sm dark:prose-invert max-w-none mt-4 border rounded-lg p-4 bg-muted/50">
             <h3 className="flex items-center gap-2 font-semibold">
                <Sparkles className="w-5 h-5 text-accent" />
                Explanation of Changes
             </h3>
             <ReactMarkdown>{result.explanation}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
