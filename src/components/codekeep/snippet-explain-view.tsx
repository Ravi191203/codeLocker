
"use client"

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Snippet } from '@/lib/data';
import { explainCode } from '@/ai/flows/explain-code';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SnippetExplainViewProps {
  snippet: Snippet;
}

export function SnippetExplainView({ snippet }: SnippetExplainViewProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const { toast } = useToast();

  const handleExplainCode = async () => {
    setIsExplaining(true);
    setExplanation(null);
    try {
      const result = await explainCode({ code: snippet.code, language: snippet.language });
      setExplanation(result.explanation);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem generating the explanation.',
      });
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="p-4 border rounded-md min-h-[400px]">
      <Button variant="outline" size="sm" onClick={handleExplainCode} disabled={isExplaining}>
        {isExplaining ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        {explanation ? 'Regenerate Explanation' : 'Explain Code'}
      </Button>
      {isExplaining && !explanation && <div className="text-sm text-muted-foreground mt-4 flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {explanation && (
        <div className="prose prose-sm dark:prose-invert max-w-none mt-4 border rounded-lg p-4 bg-muted/50">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      margin: '1rem 0',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-background rounded-md px-1 py-0.5 font-mono text-sm" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {explanation}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
