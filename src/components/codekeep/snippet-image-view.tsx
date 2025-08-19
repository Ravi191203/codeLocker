
"use client"

import { useState } from 'react';
import { Camera, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Snippet } from '@/lib/data';
import { generateImageFromCode } from '@/ai/flows/generate-image-from-code';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const imageThemes = ['dark', 'light', 'synthwave', 'pastel', 'ocean', 'forest'] as const;

interface SnippetImageViewProps {
  snippet: Snippet;
}

export function SnippetImageView({ snippet }: SnippetImageViewProps) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageTheme, setImageTheme] = useState<(typeof imageThemes)[number]>(imageThemes[0]);
  const { toast } = useToast();

  const handleGenerateImage = async () => {
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

  return (
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
  );
}
