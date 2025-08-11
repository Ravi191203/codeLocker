"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyButtonProps {
    textToCopy: string;
}

export function CopyButton({ textToCopy }: CopyButtonProps) {
    const [hasCopied, setHasCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setHasCopied(true);
            toast({
                title: "Copied!",
                description: "The text has been copied to your clipboard.",
            });
            setTimeout(() => {
                setHasCopied(false);
            }, 2000);
        });
    }

    return (
        <Button size="icon" variant="outline" onClick={handleCopy} aria-label="Copy to clipboard">
            {hasCopied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    )
}
