
import { getSnippets } from "@/app/actions";
import { ActivityCalendar } from "@/components/codekeep/activity-calendar";
import { LanguageChart } from "@/components/codekeep/language-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { languages } from "@/lib/data";
import { BarChart3, CalendarDays, Code, FileText, Tags } from "lucide-react";

export default async function AnalyticsPage() {
    const snippets = await getSnippets();
    const totalSnippets = snippets.length;
    
    const languageCounts = snippets.reduce((acc, snippet) => {
        acc[snippet.language] = (acc[snippet.language] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const uniqueLanguages = Object.keys(languageCounts).length;
    
    const totalTags = snippets.reduce((acc, snippet) => acc + snippet.tags.length, 0);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    A visual overview of your code snippets.
                </p>
            </header>

             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSnippets}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Languages Used</CardTitle>
                        <Code className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueLanguages}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
                        <Tags className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTags}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <BarChart3 className="w-6 h-6 text-accent" />
                            Snippets by Language
                        </CardTitle>
                        <CardDescription>
                            Your most used programming languages based on snippet count.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                           <LanguageChart data={snippets} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                           <CalendarDays className="w-6 h-6 text-accent" />
                           Activity Calendar
                        </CardTitle>
                        <CardDescription>
                            Your snippet creation activity over the last year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                         <div className="h-auto md:h-[350px] flex items-center justify-center">
                           <ActivityCalendar data={snippets} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="w-3.5 h-3.5 rounded-sm sm:w-4 sm:h-4 bg-muted/50" />
                <div className="w-3.5 h-3.5 rounded-sm sm:w-4 sm:h-4 bg-accent/40" />
                <div className="w-3.5 h-3.5 rounded-sm sm:w-4 sm:h-4 bg-accent/60" />
                <div className="w-3.5 h-3.5 rounded-sm sm:w-4 sm:h-4 bg-accent/80" />
                <div className="w-3.5 h-3.5 rounded-sm sm:w-4 sm:h-4 bg-accent" />
                <span>More</span>
            </div>
        </div>
    )
}
