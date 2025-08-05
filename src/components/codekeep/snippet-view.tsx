"use client";

import React, { useState } from 'react';
import type { Snippet } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './code-block';
import { Pencil, Trash2, Sparkles, Loader2, Languages } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { explainCode } from '@/ai/flows/explain-code';
import { convertCode } from '@/ai/flows/convert-code';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { languages } from '@/lib/data';

interface SnippetViewProps {
  snippet: Snippet | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function SnippetView({ snippet, onEdit, onDelete }: SnippetViewProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [convertedCode, setConvertedCode] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>(languages[0]);
  const { toast } = useToast();

  if (!snippet) {
    return null;
  }
  
  const handleExplainCode = async () => {
    if (!snippet) return;
    setIsExplaining(true);
    setExplanation(null);
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

  const handleConvertCode = async () => {
    if (!snippet || !targetLanguage) return;
    setIsConverting(true);
    setConvertedCode(null);
    try {
      const result = await convertCode({
        code: snippet.code,
        sourceLanguage: snippet.language,
        targetLanguage: targetLanguage
      });
      setConvertedCode(result.convertedCode);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem converting the code.",
      });
    } finally {
      setIsConverting(false);
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
        
        <div className="space-y-2">
           <div className="flex items-center justify-between">
             <h3 className="font-semibold text-sm text-muted-foreground">Code</h3>
           </div>
           <div className="h-full max-h-[300px]">
             <CodeBlock code={snippet.code} language={snippet.language} className="h-full" />
           </div>
        </div>

        <Accordion type="multiple" className="w-full space-y-4">
          <AccordionItem value="item-1" className="border rounded-md px-4">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">AI Explanation</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <Button variant="outline" size="sm" onClick={handleExplainCode} disabled={isExplaining}>
                  {isExplaining ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {explanation ? 'Regenerate Explanation' : 'Explain Code'}
                </Button>
                {isExplaining && !explanation && <p className="text-sm text-muted-foreground mt-4">Generating explanation...</p>}
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
              </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border rounded-md px-4">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">AI Code Converter</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="flex items-center gap-2">
                  <Select onValueChange={setTargetLanguage} defaultValue={targetLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.filter(l => l !== snippet.language).map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleConvertCode} disabled={isConverting}>
                    {isConverting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Languages className="h-4 w-4 mr-2" />
                    )}
                    Convert
                  </Button>
                </div>

                {(isConverting || convertedCode) && (
                  <div className="mt-4">
                    {isConverting && <p className="text-sm text-muted-foreground">Converting code...</p>}
                    {convertedCode && (
                       <div className="h-full max-h-[300px] mt-2">
                         <CodeBlock code={convertedCode} language={targetLanguage} className="h-full" />
                       </div>
                    )}
                  </div>
                )}
              </AccordionContent>
          </AccordionItem>
        </Accordion>

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
