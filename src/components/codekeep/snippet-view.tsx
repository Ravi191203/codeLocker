
"use client";

import React, { useState } from 'react';
import type { Bug, Snippet } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './code-block';
import { Pencil, Trash2, Sparkles, Loader2, Languages, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { explainCode } from '@/ai/flows/explain-code';
import { convertCode } from '@/ai/flows/convert-code';
import { findBugs } from '@/ai/flows/find-bugs';
import { addSnippet } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { languages } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';

interface SnippetViewProps {
  snippet: Snippet | null;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
}

export function SnippetView({ snippet, onEdit, onDelete, onSave }: SnippetViewProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [convertedCode, setConvertedCode] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>(languages[0]);
  const [bugs, setBugs] = useState<Bug[] | null>(null);
  const [isFindingBugs, setIsFindingBugs] = useState(false);

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

  const handleSaveConvertedCode = async () => {
    if (!snippet || !convertedCode || !targetLanguage) return;
    setIsSaving(true);
    try {
      await addSnippet({
        name: `${snippet.name} (converted to ${targetLanguage})`,
        description: snippet.description,
        code: convertedCode,
        language: targetLanguage,
        tags: snippet.tags.join(','),
      });
      toast({
        title: 'Snippet saved!',
        description: 'The converted snippet has been added to your collection.',
      });
      onSave();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem saving the new snippet.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFindBugs = async () => {
    if (!snippet) return;
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
        
        <Tabs defaultValue="code" className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="explanation">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Explanation
            </TabsTrigger>
            <TabsTrigger value="converter">
              <Languages className="h-4 w-4 mr-2" />
              AI Code Converter
            </TabsTrigger>
            <TabsTrigger value="bug-finder">
              <AlertTriangle className="h-4 w-4 mr-2" />
              AI Bug Finder
            </TabsTrigger>
          </TabsList>
          <TabsContent value="code">
            <div className="h-full max-h-[300px]">
              <CodeBlock code={snippet.code} language={snippet.language} className="h-full" />
            </div>
          </TabsContent>
          <TabsContent value="explanation">
            <div className="p-4 border rounded-md">
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
            </div>
          </TabsContent>
          <TabsContent value="converter">
             <div className="p-4 border rounded-md space-y-4">
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
                       <div className="space-y-2">
                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={handleSaveConvertedCode} disabled={isSaving}>
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save as New Snippet
                            </Button>
                        </div>
                         <div className="h-full max-h-[300px] mt-2">
                           <CodeBlock code={convertedCode} language={targetLanguage} className="h-full" />
                         </div>
                       </div>
                    )}
                  </div>
                )}
             </div>
          </TabsContent>
          <TabsContent value="bug-finder">
            <div className="p-4 border rounded-md space-y-4">
              <Button variant="outline" size="sm" onClick={handleFindBugs} disabled={isFindingBugs}>
                {isFindingBugs ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                {bugs ? 'Scan Again' : 'Find Bugs'}
              </Button>
              {isFindingBugs && <p className="text-sm text-muted-foreground mt-4">Scanning for bugs...</p>}
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
                <ScrollArea className="mt-4 h-[250px] space-y-4">
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
          </TabsContent>
        </Tabs>
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
