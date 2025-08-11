import { getUser } from "@/app/actions";
import { CopyButton } from "@/components/codekeep/copy-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Code2 } from "lucide-react";

export default async function ExtensionPage() {
    const user = await getUser();
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/api/v1/snippets`;

    return (
        <div className="p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Code2 className="w-8 h-8 text-accent" />
                    VS Code Extension
                </h1>
                <p className="text-muted-foreground mt-1">
                    Integrate CodeKeep directly into your editor.
                </p>
            </header>
            
            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>
                        Use the details below to set up the CodeKeep VS Code extension. 
                        You can find the (hypothetical) extension on the Visual Studio Marketplace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="api-key" className="text-sm font-medium">Your API Key</label>
                        <div className="flex items-center gap-2">
                            <Input id="api-key" readOnly value={user.apiKey} className="font-mono" />
                            <CopyButton textToCopy={user.apiKey} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Keep this key secret. Do not share it or expose it in client-side code.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="api-endpoint" className="text-sm font-medium">API Endpoint</label>
                        <div className="flex items-center gap-2">
                            <Input id="api-endpoint" readOnly value={apiUrl} className="font-mono" />
                            <CopyButton textToCopy={apiUrl} />
                        </div>
                         <p className="text-xs text-muted-foreground">
                            This is the endpoint the extension will use to fetch your snippets.
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-3">
                        <h4 className="font-semibold">Setup Instructions</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Install the "CodeKeep Snippets" extension from the VS Code Marketplace.</li>
                            <li>Open the command palette (Ctrl/Cmd + Shift + P) and run "CodeKeep: Configure API Key".</li>
                            <li>Paste your API Key when prompted.</li>
                            <li>Configure the API endpoint in the extension settings if it's different from the default.</li>
                            <li>Start searching and using your snippets directly from VS Code!</li>
                        </ol>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}