
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import type { Bug, Snippet, SnippetVersion } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './code-block';
import { Pencil, Trash2, Sparkles, Loader2, Languages, Save, AlertTriangle, ShieldCheck, History, Undo, Share2, Copy, Check, Eye, GitCompareArrows, Camera, Download } from 'lucide-react';
import { explainCode } from '@/ai/flows/explain-code';
import { convertCode } from '@/ai/flows/convert-code';
import { findBugs } from '@/ai/flows/find-bugs';
import { addSnippet, getSnippetVersions, restoreSnippetVersion, updateSnippetSharing } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { languages } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import DiffViewer from 'react-diff-viewer-continued';
import { generateImageFromCode } from '@/ai/flows/generate-image-from-code';
import Image from 'next/image';

interface SnippetViewProps {
  snippet: Snippet | null;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
}

const imageThemes = ['dark', 'light', 'synthwave', 'pastel', 'ocean', 'forest'] as const;

export function SnippetView({ snippet: initialSnippet, onEdit, onDelete, onSave }: SnippetViewProps) {
  const [snippet, setSnippet] = useState(initialSnippet);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [convertedCode, setConvertedCode] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>(languages[0]);
  const [bugs, setBugs] = useState<Bug[] | null>(null);
  const [isFindingBugs, setIsFindingBugs] = useState(false);
  const [versions, setVersions] = useState<SnippetVersion[]>([]);
  const [isFetchingVersions, setIsFetchingVersions] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isSharing, startSharingTransition] = useTransition();
  const [hasCopied, setHasCopied] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<SnippetVersion | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<SnippetVersion[]>([]);
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageTheme, setImageTheme] = useState<(typeof imageThemes)[number]>(imageThemes[0]);


  const { toast } = useToast();

  useEffect(() => {
    setSnippet(initialSnippet);
    setExplanation(null);
    setConvertedCode(null);
    setBugs(null);
    setVersions([]);
    setViewingVersion(null);
    setSelectedVersions([]);
    setGeneratedImage(null);
  }, [initialSnippet]);

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

  const handleFetchVersions = async () => {
    if (!snippet) return;
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
        onSave(); // This will trigger a refetch and update the view
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

  const handleVersionSelection = (version: SnippetVersion) => {
    setSelectedVersions(prev => {
        const isSelected = prev.some(v => v._id === version._id);
        if (isSelected) {
            return prev.filter(v => v._id !== version._id);
        }
        if (prev.length < 2) {
            return [...prev, version];
        }
        // If 2 are already selected, replace the last one
        return [prev[0], version];
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

  const handleGenerateImage = async () => {
    if (!snippet) return;
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const result = await generateImageFromCode({
        code: snippet.code,
        language: snippet.language,
        theme: imageTheme,
      });
      setGeneratedImage(result.imageUrl);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem generating the image.',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };


  const shareUrl = snippet.isPublic && snippet.shareId ? `${window.location.origin}/s/${snippet.shareId}` : '';

  return (
    <>
      <div className="p-6 pb-0">
        <div className="flex justify-between items-start gap-4">
            <div className='flex-1'>
                <h2 className="text-2xl font-bold leading-none tracking-tight truncate">{snippet.name}</h2>
            </div>
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
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Description</h3>
          <p className="text-sm text-foreground/80">{snippet.description}</p>
        </div>

        <div>
           <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Language & Tags</h3>
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
          <TabsList className="w-full justify-start md:w-auto overflow-x-auto">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="explanation">
              <Sparkles className="h-4 w-4 mr-2" />
              Explain
            </TabsTrigger>
            <TabsTrigger value="converter">
              <Languages className="h-4 w-4 mr-2" />
              Convert
            </TabsTrigger>
            <TabsTrigger value="bug-finder">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Find Bugs
            </TabsTrigger>
            <TabsTrigger value="history" onClick={handleFetchVersions}>
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="image">
              <Camera className="h-4 w-4 mr-2" />
              Image
            </TabsTrigger>
          </TabsList>
          <TabsContent value="code">
            <div className="h-full max-h-[400px]">
              <CodeBlock code={snippet.code} language={snippet.language} className="h-full" />
            </div>
          </TabsContent>
          <TabsContent value="explanation">
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
          </TabsContent>
          <TabsContent value="converter">
             <div className="p-4 border rounded-md space-y-4 min-h-[400px]">
                <div className="flex items-center gap-2">
                  <Select onValueChange={setTargetLanguage} defaultValue={targetLanguage}>
                    <SelectTrigger className="w-full md:w-[180px]">
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
                    {isConverting && <div className="text-sm text-muted-foreground mt-4 flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
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
          </TabsContent>
           <TabsContent value="history">
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
          </TabsContent>
           <TabsContent value="image">
                <div className="p-4 border rounded-md space-y-4 min-h-[400px]">
                    <div className="flex items-center gap-2">
                        <Select onValueChange={(value) => setImageTheme(value as typeof imageThemes[number])} defaultValue={imageTheme}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                {imageThemes.map(theme => (
                                    <SelectItem key={theme} value={theme} className="capitalize">{theme}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={handleGenerateImage} disabled={isGeneratingImage}>
                            {isGeneratingImage ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Camera className="h-4 w-4 mr-2" />
                            )}
                            Generate Image
                        </Button>
                    </div>

                    {(isGeneratingImage || generatedImage) && (
                        <div className="mt-4 rounded-lg bg-muted/50 p-4 flex items-center justify-center min-h-[300px]">
                            {isGeneratingImage && <div className="text-sm text-muted-foreground flex flex-col items-center gap-2"><Loader2 className="h-8 w-8 animate-spin" /><span>Generating your image...</span></div>}
                            {generatedImage && (
                                <div className="space-y-4 flex flex-col items-center">
                                    <Image
                                        src={generatedImage}
                                        alt="Generated code snippet"
                                        width={800}
                                        height={400}
                                        className="rounded-lg shadow-lg border"
                                    />
                                    <a href={generatedImage} download={`${snippet.name.replace(/\s/g, '_')}.png`}>
                                        <Button size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Image
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex items-center justify-end gap-2 p-6 border-t pt-4 bg-muted/50">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
           <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
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
