"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
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
import { FileUp, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AiSource = {
  id: number;
  provider: string;
  apiKey: string;
};

export function SourcesForm() {
  const { toast } = useToast();
  const { handleSubmit } = useForm();

  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiSources, setAiSources] = useState<AiSource[]>([
    { id: 1, provider: "groq", apiKey: "" },
  ]);

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
  
  const onSubmit = () => {
    toast({
        title: "Sources Saved",
        description: "Your source configurations have been successfully saved.",
    });
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCredentialFile(null)}>
                      <X className="h-4 w-4" />
                  </Button>
                </div>
                {isUploading && <Progress value={uploadProgress} className="h-2" />}
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
                  <Select defaultValue={source.provider}>
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
                    <Input id={`api-key-${source.id}`} type="password" placeholder="••••••••••••••••" />
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
          <Button type="submit">Save Sources</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
