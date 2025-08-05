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
import { languages, type Snippet, type Folder } from '@/lib/data';
import { useTransition } from 'react';
import { updateSnippet } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DialogFooter } from '../ui/dialog';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  code: z.string().min(10, "Code must be at least 10 characters."),
  language: z.string(),
  tags: z.string(),
  folder: z.string().optional(),
});

type EditSnippetFormProps = {
  snippet: Snippet;
  onSuccess: () => void;
  folders: Folder[];
};

export function EditSnippetForm({ snippet, onSuccess, folders }: EditSnippetFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: snippet.name,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags.join(', '),
      folder: snippet.folder || "no-folder",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await updateSnippet(snippet._id, values);
        toast({
          title: "Snippet updated!",
          description: "Your snippet has been saved successfully.",
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
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
              <FormLabel>Code</FormLabel>
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
         <FormField
              control={form.control}
              name="folder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to a folder (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-folder">No Folder</SelectItem>
                      {folders.map(folder => <SelectItem key={folder._id} value={folder._id}>{folder.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <DialogFooter className="border-t pt-4 bg-muted/50 p-6">
            <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
