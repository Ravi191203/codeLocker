
"use client"

import { useState } from 'react';
import { Languages, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { languages, type Snippet } from '@/lib/data';
import { convertCode } from '@/ai/flows/convert-code';
import { addSnippet } from '@/app/actions';
import { CodeBlock } from './code-block';
import { useRouter } from 'next/navigation';

interface SnippetConvertViewProps {
  snippet: Snippet;
}

export function SnippetConvertView({ snippet }: SnippetConvertViewProps) {
  const [convertedCode, setConvertedCode] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isSavingConverted, setIsSavingConverted] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>(languages.find(l => l !== snippet.language) || languages[0]);
  const { toast } = useToast();
  const router = useRouter();

  const handleConvertCode = async () => {
    setIsConverting(true);
    setConvertedCode(null);
    try {
      const result = await convertCode({
        code: snippet.code,
        sourceLanguage: snippet.language,
        targetLanguage: targetLanguage,
      });
      setConvertedCode(result.convertedCode);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem converting the code.',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleSaveConvertedCode = async () => {
    if (!convertedCode) return;
    setIsSavingConverted(true);
    try {
      await addSnippet({
        name: `${snippet.name} (converted to ${targetLanguage})`,
        description: `Converted from ${snippet.language}. ${snippet.description}`,
        code: convertedCode,
        language: targetLanguage,
        tags: snippet.tags.join(','),
      });
      toast({
        title: 'Snippet saved!',
        description: 'The converted snippet has been added to your collection.',
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem saving the new snippet.',
      });
    } finally {
      setIsSavingConverted(false);
    }
  };

  return (
    <div className="p-4 border rounded-md space-y-4 min-h-[400px]">
      <div className="flex items-center gap-2">
        <Select onValueChange={setTargetLanguage} defaultValue={targetLanguage}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.filter(l => l !== snippet.language).map(lang => (
              <SelectItem key={lang} value={lang} className="capitalize">{lang}</SelectItem>
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
                <Button variant="outline" size="sm" onClick={handleSaveConvertedCode} disabled={isSavingConverted}>
                  {isSavingConverted ? (
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
  );
}
