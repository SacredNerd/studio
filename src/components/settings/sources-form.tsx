"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function SourcesForm() {
  return (
    <Card className="neobrutal-shadow">
      <CardHeader>
        <CardTitle className="font-headline">Sources</CardTitle>
        <CardDescription>
          Connect your accounts to find the best job matches.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gmail */}
        <div className="space-y-4 p-4 border-2 rounded-none">
          <h3 className="font-semibold font-headline">Gmail</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground truncate">
                <span>credentials.json</span>
            </div>
            <Button variant="outline" size="sm">Upload</Button>
          </div>
        </div>

        {/* AI */}
        <div className="space-y-4 p-4 border-2 rounded-none">
          <h3 className="font-semibold font-headline">AI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai-provider">Provider</Label>
              <Select defaultValue="groq">
                <SelectTrigger id="ai-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" placeholder="••••••••••••••••" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              Add more
            </Button>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="space-y-4 p-4 border-2 rounded-none">
          <h3 className="font-semibold font-headline">LinkedIn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin-client-id">Client ID (Optional)</Label>
              <Input id="linkedin-client-id" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin-client-secret">Client Secret</Label>
              <Input id="linkedin-client-secret" type="password" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="secondary">Save Sources</Button>
      </CardFooter>
    </Card>
  );
}
