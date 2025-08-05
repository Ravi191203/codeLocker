"use client";

import React, { useState } from 'react';
import type { Snippet } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './code-block';
import { Pencil, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { explainCode } from '@/ai/flows/explain-code';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';


interface SnippetViewProps {
  snippet: Snippet | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function SnippetView({ snippet, onEdit, onDelete }: SnippetViewProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const { toast } = useToast();

  if (!snippet) {
    return null; // Don't render anything if no snippet is selected
  }
  
  const handleExplainCode = async () => {
    if (!snippet) return;
    setIsExplaining(true);
    // Don't clear old explanation for better UX
    // setExplanation(null); 
    try {
      const result = await explainCode({ code: snippet.code, language: snippet.language });
      setExplanation(result.explanation);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the explanation.",
      });
    } finally {
      setIsExplaining(false);
    }
  };


  return (
    <>
      <DialogHeader>
        <DialogTitle className="truncate">{snippet.name}</DialogTitle>
      </DialogHeader>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Description</h3>
          <p className="text-sm">{snippet.description}</p>
        </div>

        <div>
           <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Language & Tags</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">{snippet.language}</Badge>
            {snippet.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
           <div className="flex items-center justify-between mb-2">
             <h3 className="font-semibold text-sm text-muted-foreground">Code</h3>
             <Button variant="outline" size="sm" onClick={handleExplainCode} disabled={isExplaining}>
                {isExplaining ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Explain Code
              </Button>
           </div>
           <div className="h-full max-h-[300px]">
             <CodeBlock code={snippet.code} language={snippet.language} className="h-full" />
           </div>
        </div>

        {(isExplaining || explanation) && (
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
             <AccordionItem value="item-1">
                <AccordionTrigger>
                   <h3 className="font-semibold text-sm text-muted-foreground">AI Explanation</h3>
                </AccordionTrigger>
                <AccordionContent>
                  {isExplaining && !explanation && <p className="text-sm text-muted-foreground">Generating explanation...</p>}
                  {explanation && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
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
                                  backgroundColor: 'hsl(var(--muted)/0.5)',
                                  borderRadius: '0.5rem',
                                  padding: '1rem',
                                  margin: '1rem 0',
                                }}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-muted/50 rounded-md px-1 py-0.5 font-mono text-sm" {...props}>
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
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

      </div>
      <DialogFooter className="border-t pt-4 bg-muted/50 p-6 sm:justify-end">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
