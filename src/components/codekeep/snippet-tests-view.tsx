
"use client"

import { useState } from 'react';
import { Loader2, TestTube2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Snippet } from '@/lib/data';
import { generateTests } from '@/ai/flows/generate-tests';
import { CodeBlock } from './code-block';

interface SnippetTestsViewProps {
  snippet: Snippet;
}

export function SnippetTestsView({ snippet }: SnippetTestsViewProps) {
  const [generatedTests, setGeneratedTests] = useState<string | null>(null);
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const { toast } = useToast();

  const handleGenerateTests = async () => {
    setIsGeneratingTests(true);
    setGeneratedTests(null);
    try {
      const result = await generateTests({ code: snippet.code, language: snippet.language });
      setGeneratedTests(result.tests);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem generating tests.',
      });
    } finally {
      setIsGeneratingTests(false);
    }
  };

  return (
    <div className="p-4 border rounded-md space-y-4 min-h-[400px]">
      <Button variant="outline" size="sm" onClick={handleGenerateTests} disabled={isGeneratingTests}>
        {isGeneratingTests ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <TestTube2 className="h-4 w-4 mr-2" />
        )}
        {generatedTests ? 'Regenerate Tests' : 'Generate Tests'}
      </Button>
      {isGeneratingTests && <div className="text-sm text-muted-foreground mt-4 flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {generatedTests && (
        <div className="h-full max-h-[300px] mt-4">
          <CodeBlock code={generatedTests} language={snippet.language === 'javascript' ? 'typescript' : snippet.language} className="h-full" />
        </div>
      )}
    </div>
  );
}
