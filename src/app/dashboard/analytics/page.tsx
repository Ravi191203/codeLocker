import { getSnippets } from "@/app/actions";
import { ActivityCalendar } from "@/components/codekeep/activity-calendar";
import { LanguageChart } from "@/components/codekeep/language-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CalendarDays } from "lucide-react";

export default async function AnalyticsPage() {
    const snippets = await getSnippets();

    return (
        <div className="p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    A visual overview of your code snippets.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
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
                        <div className="h-[300px]">
                           <LanguageChart data={snippets} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                           <CalendarDays className="w-6 h-6 text-accent" />
                           Activity Calendar
                        </CardTitle>
                        <CardDescription>
                            Your snippet creation activity over the last year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="h-[300px] flex items-center justify-center">
                           <ActivityCalendar data={snippets} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}