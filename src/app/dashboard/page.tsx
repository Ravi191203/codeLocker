import { getSnippets } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Code, Languages, Tag } from 'lucide-react';
import { LanguageChart } from '@/components/dashboard/language-chart';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentSnippets } from '@/components/dashboard/recent-snippets';

export default async function DashboardPage() {
    const snippets = await getSnippets();

    const totalSnippets = snippets.length;
    const totalLanguages = new Set(snippets.map(s => s.language)).size;
    const totalTags = new Set(snippets.flatMap(s => s.tags)).size;

    const languageData = snippets.reduce((acc: { [key: string]: any }, snippet) => {
        const lang = snippet.language;
        if (!acc[lang]) {
            acc[lang] = { name: lang, value: 0 };
        }
        acc[lang].value += 1;
        return acc;
    }, {});
    
    const chartData = Object.values(languageData);
    const recentSnippets = snippets.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total Snippets"
                    value={totalSnippets}
                    icon={<Code className="h-4 w-4 text-muted-foreground" />}
                    description="The total number of code snippets in your collection."
                />
                <StatCard 
                    title="Languages Used"
                    value={totalLanguages}
                    icon={<Languages className="h-4 w-4 text-muted-foreground" />}
                    description="The number of unique programming languages across your snippets."
                />
                <StatCard 
                    title="Total Tags"
                    value={totalTags}
                    icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                    description="The number of unique tags used to categorize snippets."
                />
                <StatCard 
                    title="Avg. Snippets/Lang"
                    value={totalLanguages > 0 ? (totalSnippets / totalLanguages).toFixed(1) : 0}
                    icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
                    description="The average number of snippets per programming language."
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Language Distribution</CardTitle>
                        <CardDescription>
                            A breakdown of your snippets by programming language.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pr-0">
                        {chartData.length > 0 ? (
                           <LanguageChart data={chartData} />
                        ) : (
                            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                                No language data to display. Add some snippets!
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-4 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Snippets</CardTitle>
                        <CardDescription>
                            Your most recently created or updated snippets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentSnippets snippets={recentSnippets} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
