"use client";

import { useState, useRef, useTransition } from "react";
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
import { Progress } from "@/components/ui/progress";
import { FileUp, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveSettings } from "@/app/actions";
import { useRouter } from "next/navigation";

type AiSource = {
  id: number;
  provider: string;
  apiKey: string;
};

interface SourcesFormProps {
    settings: any;
}

export function SourcesForm({ settings }: SourcesFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [credentialFile, setCredentialFile] = useState<File | null>(settings?.gmail?.fileName ? new File([], settings.gmail.fileName) : null);
  const [uploadProgress, setUploadProgress] = useState(settings?.gmail?.fileName ? 100 : 0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiSources, setAiSources] = useState<AiSource[]>(
    settings?.aiSources || [{ id: 1, provider: "groq", apiKey: "" }]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setCredentialFile(file);
      handleUpload(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid JSON file.",
      });
    }
  };

  const handleUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleAddMore = () => {
    setAiSources([...aiSources, { id: Date.now(), provider: 'gemini', apiKey: '' }]);
  };

  const handleRemoveSource = (id: number) => {
    setAiSources(aiSources.filter(source => source.id !== id));
  };
  
  const handleAiSourceChange = (id: number, field: 'provider' | 'apiKey', value: string) => {
    setAiSources(aiSources.map(source => source.id === id ? { ...source, [field]: value } : source));
  }

  const handleLinkedinChange = (field: 'clientId' | 'clientSecret', value: string) => {
    // This is just a placeholder for now. 
    // In a real app you'd update state that is part of the form submission
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
        const settingsToSave = {
            gmail: {
                fileName: credentialFile?.name
            },
            aiSources,
            linkedin: {
                // In a real app, you would get these values from state.
                clientId: (document.getElementById('linkedin-client-id') as HTMLInputElement).value,
                clientSecret: (document.getElementById('linkedin-client-secret') as HTMLInputElement).value,
            }
        };

        const result = await saveSettings(settingsToSave);

        if (result.success) {
            toast({
                title: "Sources Saved",
                description: "Your source configurations have been successfully saved.",
            });
            router.refresh();
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: result.error || "Could not save settings.",
            });
        }
    });
  };


  return (
    <form onSubmit={onSubmit}>
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
            {!credentialFile ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Upload credentials.json
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{credentialFile.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setCredentialFile(null); setUploadProgress(0); }}>
                      <X className="h-4 w-4" />
                  </Button>
                </div>
                {(isUploading || uploadProgress > 0) && <Progress value={uploadProgress} className="h-2" />}
              </div>
            )}
          </div>

          {/* AI */}
          <div className="space-y-4 p-4 border-2 rounded-none">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold font-headline">AI</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMore}>
                Add more
              </Button>
            </div>

            {aiSources.map((source) => (
              <div key={source.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor={`ai-provider-${source.id}`}>Provider</Label>
                  <Select 
                    value={source.provider} 
                    onValueChange={(value) => handleAiSourceChange(source.id, 'provider', value)}
                  >
                    <SelectTrigger id={`ai-provider-${source.id}`}>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="groq">Groq</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <div className="space-y-2 w-full">
                    <Label htmlFor={`api-key-${source.id}`}>API Key</Label>
                    <Input 
                      id={`api-key-${source.id}`} 
                      type="password" 
                      placeholder="••••••••••••••••" 
                      value={source.apiKey}
                      onChange={(e) => handleAiSourceChange(source.id, 'apiKey', e.target.value)}
                    />
                  </div>
                  {aiSources.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-10 w-10 self-end" onClick={() => handleRemoveSource(source.id)}>
                          <X className="h-4 w-4" />
                      </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* LinkedIn */}
          <div className="space-y-4 p-4 border-2 rounded-none">
            <h3 className="font-semibold font-headline">LinkedIn (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin-client-id">Client ID</Label>
                <Input id="linkedin-client-id" defaultValue={settings?.linkedin?.clientId} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin-client-secret">Client Secret</Label>
                <Input id="linkedin-client-secret" type="password" defaultValue={settings?.linkedin?.clientSecret} />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Sources
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
