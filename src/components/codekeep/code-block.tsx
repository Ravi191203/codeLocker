"use client";

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true);
      toast({
        title: 'Copied to clipboard!',
        description: 'You can now paste the code anywhere.',
      });
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    });
  };

  return (
    <div className={cn('relative group h-full', className)}>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 z-10"
        onClick={copyToClipboard}
        aria-label="Copy code"
      >
        {hasCopied ? (
          <Check className="h-4 w-4 text-accent" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{ 
            margin: 0, 
            padding: '1rem',
            borderRadius: '0.5rem',
            height: '100%',
            overflow: 'auto',
            backgroundColor: 'hsl(var(--muted)/0.5)',
        }}
        codeTagProps={{
            className: 'text-sm text-foreground/90'
        }}
        
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
