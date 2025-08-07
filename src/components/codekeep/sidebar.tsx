"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Code, FileCode, Plus, Search, Menu, LayoutDashboard } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Snippet } from '@/lib/data';
import { cn } from '@/lib/utils';
import { SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarFooter } from '../ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AppSidebarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  onAddSnippet: () => void;
  snippets: Snippet[];
  onSelectSnippet: (snippet: Snippet) => void;
  selectedSnippetId: string | null;
  onHomeNavigation: () => void;
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

export function AppSidebar({
  searchTerm,
  onSearch,
  sortOption,
  onSortChange,
  onAddSnippet,
  snippets,
  onSelectSnippet,
  selectedSnippetId,
  onHomeNavigation,
}: AppSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
        <SidebarHeader className='p-4'>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight text-accent">CodeKeep</h1>
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
        </SidebarHeader>

        <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={onHomeNavigation} tooltip='Dashboard'>
                        <LayoutDashboard />
                        <span>Dashboard</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarGroup>
                    <SidebarGroupLabel>Snippets</SidebarGroupLabel>
                    <SidebarMenu className='mt-2'>
                        {snippets.length > 0 ? (
                            snippets.map(snippet => (
                                <SidebarMenuItem key={snippet._id}>
                                    <SidebarMenuButton 
                                        onClick={() => onSelectSnippet(snippet)} 
                                        isActive={selectedSnippetId === snippet._id}
                                        tooltip={snippet.name}
                                    >
                                        <Code className="text-accent" />
                                        <span>{truncateName(snippet.name, 4)}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))
                        ) : (
                            <div className="text-center p-8 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                                <FileCode className="w-10 h-10 mx-auto mb-2" />
                                <p className="font-semibold">No snippets found.</p>
                                <p className="text-xs">Add a new snippet to get started.</p>
                            </div>
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className='p-4'>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={onAddSnippet}>
            <Plus className="mr-2 h-4 w-4" />
            <span className='group-data-[collapsible=icon]:hidden'>New Snippet</span>
            </Button>
        </SidebarFooter>
    </div>
  );
}
