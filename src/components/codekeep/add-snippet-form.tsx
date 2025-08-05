"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { languages } from '@/lib/data';
import { useTransition, useState } from 'react';
import { addSnippet } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DialogFooter } from '../ui/dialog';
import { generateSnippetDetails } from '@/ai/flows/generate-snippet-details';
import { Sparkles } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  code: z.string().min(10, "Code must be at least 10 characters."),
  language: z.string(),
  tags: z.string(),
});

type AddSnippetFormProps = {
  onSuccess: () => void;
};

export function AddSnippetForm({ onSuccess }: AddSnippetFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      language: languages[0],
      tags: "",
    },
  });

  const handleAutoFill = () => {
    const code = form.getValues("code");
    const language = form.getValues("language");

    if (!code || code.length < 10) {
      toast({
        variant: "destructive",
        title: "Code is too short",
        description: "Please enter at least 10 characters of code to use the AI assistant.",
      });
      return;
    }

    setIsGenerating(true);
    startTransition(async () => {
      try {
        const result = await generateSnippetDetails({ code, language });
        if (result) {
          form.setValue("name", result.name, { shouldValidate: true });
          form.setValue("description", result.description, { shouldValidate: true });
          form.setValue("tags", result.tags.join(', '), { shouldValidate: true });
           toast({
            title: "AI Assistant finished!",
            description: "The name, description, and tags have been filled out.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with the AI request.",
        });
      } finally {
        setIsGenerating(false);
      }
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await addSnippet(values);
        toast({
          title: "Snippet created!",
          description: "Your new snippet has been saved successfully.",
        });
        onSuccess();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-6 space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. React Auth Hook" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe what this snippet does..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Code</FormLabel>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAutoFill} disabled={isGenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Auto-fill with AI"}
                  </Button>
                </div>
                <FormControl>
                  <Textarea placeholder="Paste your code here" className="min-h-[200px] font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
              <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                          <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                      </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                      <Input placeholder="react, hook, auth (comma-separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
              />
          </div>
        </div>
        <DialogFooter className="border-t pt-4 bg-muted/50 p-6">
            <Button type="submit" disabled={isPending || isGenerating}>
            {isPending ? "Adding..." : "Add Snippet"}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
