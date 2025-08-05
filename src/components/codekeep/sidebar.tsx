"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Code, FileCode, Plus, Search, Menu, Folder as FolderIcon, MoreVertical, Trash2, FolderPlus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Snippet, Folder } from '@/lib/data';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '../ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppSidebarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  onAddSnippet: () => void;
  snippets: Snippet[];
  onSelectSnippet: (snippet: Snippet) => void;
  selectedSnippetId: string | null;
  folders: Folder[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
}

const languageExtensions: { [key: string]: string } = {
  javascript: '.js',
  python: '.py',
  html: '.html',
  css: '.css',
  sql: '.sql',
  typescript: '.ts',
  java: '.java',
  csharp: '.cs',
  cpp: '.cpp',
  php: '.php',
  ruby: '.rb',
  go: '.go',
  swift: '.swift',
  kotlin: '.kt',
  rust: '.rs',
  bash: '.sh',
  powershell: '.ps1',
  json: '.json',
  yaml: '.yaml',
  markdown: '.md',
};

const truncateName = (name: string, wordLimit: number) => {
    const words = name.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    return name;
}

function AddFolderPopover({ onAddFolder }: { onAddFolder: (name: string) => void }) {
  const [folderName, setFolderName] = useState('');
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (folderName.trim()) {
      onAddFolder(folderName.trim());
      setFolderName('');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <FolderPlus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2">
        <div className="space-y-2">
          <p className="text-sm font-medium">New Folder</p>
          <Input
            placeholder="Folder name..."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button size="sm" className="w-full" onClick={handleAdd}>Add</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function AppSidebar({
  searchTerm,
  onSearch,
  sortOption,
  onSortChange,
  onAddSnippet,
  snippets,
  onSelectSnippet,
  selectedSnippetId,
  folders,
  selectedFolder,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
}: AppSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-4 space-y-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">CodeLocker</h1>
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
              <SidebarTrigger>
                <Menu />
              </SidebarTrigger>
            </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            className="pl-9 bg-muted/50 focus:bg-background"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
         <Select value={sortOption} onValueChange={onSortChange}>
            <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="a-z">A-Z</SelectItem>
                <SelectItem value="z-a">Z-A</SelectItem>
            </SelectContent>
         </Select>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          <div>
            <div className="px-2 py-1 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-muted-foreground">FOLDERS</h2>
              <AddFolderPopover onAddFolder={onAddFolder} />
            </div>
            <ul className="space-y-1 mt-1">
              <li>
                  <button
                    onClick={() => onSelectFolder(null)}
                    className={cn(
                      "w-full text-left p-2 rounded-md text-sm flex items-start gap-3",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      selectedFolder === null && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <FolderIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold truncate">All Snippets</p>
                    </div>
                  </button>
                </li>
              {folders.map(folder => (
                <li key={folder._id}>
                  <div className={cn(
                      "group w-full text-left p-2 rounded-md text-sm flex items-start gap-3",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                       selectedFolder === folder._id && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}>
                    <button onClick={() => onSelectFolder(folder._id)} className="flex items-start gap-3 flex-1 overflow-hidden">
                      <FolderIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate">{folder.name}</p>
                      </div>
                    </button>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100">
                             <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem className="text-destructive">
                               <Trash2 className="mr-2 h-4 w-4" />
                               Delete
                             </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{folder.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the folder, but not the snippets inside it. The snippets will be moved to "All Snippets". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteFolder(folder._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="px-2 py-1 text-xs font-semibold text-muted-foreground">SNIPPETS</h2>
            {snippets.length > 0 ? (
              <ul className="space-y-1 mt-1">
                {snippets.map(snippet => (
                  <li key={snippet._id}>
                    <button
                      onClick={() => onSelectSnippet(snippet)}
                      className={cn(
                        "w-full text-left p-2 rounded-md text-sm flex items-start gap-3",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        selectedSnippetId === snippet._id && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <Code className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate">{truncateName(snippet.name, 4)}</p>
                        <p className="text-xs text-muted-foreground">
                            {snippet.language}
                            <span className="ml-1">{languageExtensions[snippet.language] || ''}</span>
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center p-8 text-sm text-muted-foreground">
                <FileCode className="w-10 h-10 mx-auto mb-2" />
                <p className="font-semibold">No snippets found.</p>
                <p className="text-xs">
                  {selectedFolder ? "This folder is empty." : "Add a new snippet to get started."}
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <Button className="w-full" onClick={onAddSnippet}>
          <Plus className="mr-2 h-4 w-4" />
          New Snippet
        </Button>
      </div>
    </div>
  );
}
