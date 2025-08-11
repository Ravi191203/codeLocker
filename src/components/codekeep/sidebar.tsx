"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Code, FileCode, Plus, Search, Menu, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Snippet } from '@/lib/data';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '../ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from '../ui/badge';
import React from 'react';


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

const truncateName = (name: string, wordLimit: number) => {
  const words = name.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return name;
};

const groupSnippetsByLanguage = (snippets: Snippet[]) => {
    return snippets.reduce((acc, snippet) => {
        const lang = snippet.language;
        if (!acc[lang]) {
            acc[lang] = [];
        }
        acc[lang].push(snippet);
        return acc;
    }, {} as Record<string, Snippet[]>);
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
  const groupedSnippets = React.useMemo(() => groupSnippetsByLanguage(snippets), [snippets]);
  const [openLanguages, setOpenLanguages] = React.useState<string[]>([]);

  const toggleLanguage = (lang: string) => {
    setOpenLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  }
  
  React.useEffect(() => {
    // When snippets change, we might want to default to closed.
    // If we want them to default open, we'd do:
    // setOpenLanguages(Object.keys(groupedSnippets));
  }, [groupedSnippets]);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4">
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

      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onHomeNavigation} tooltip="Dashboard">
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        
          {snippets.length > 0 ? (
            Object.entries(groupedSnippets).map(([language, langSnippets]) => (
                <Collapsible key={language} open={openLanguages.includes(language)} onOpenChange={() => toggleLanguage(language)}>
                    <CollapsibleTrigger className="w-full group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-sidebar-accent">
                            <span className="text-sm font-semibold capitalize">{language}</span>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{langSnippets.length}</Badge>
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                            </div>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenu className='mt-1 ml-2 pl-2 border-l border-sidebar-border'>
                            {langSnippets.map(snippet => (
                                <SidebarMenuItem key={snippet._id}>
                                    <SidebarMenuButton 
                                        onClick={() => onSelectSnippet(snippet)} 
                                        isActive={selectedSnippetId === snippet._id}
                                        tooltip={snippet.name}
                                    >
                                        <Code className="text-accent/80" />
                                        <span>{truncateName(snippet.name, 4)}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </CollapsibleContent>
                </Collapsible>
            ))
          ) : (
            <div className="text-center p-8 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
              <FileCode className="w-10 h-10 mx-auto mb-2" />
              <p className="font-semibold">No snippets found.</p>
              <p className="text-xs">Add a new snippet to get started.</p>
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={onAddSnippet}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">New Snippet</span>
        </Button>
      </SidebarFooter>
    </div>
  );
}
