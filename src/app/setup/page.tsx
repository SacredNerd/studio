"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Briefcase } from "lucide-react";

const setupFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
});

type SetupFormValues = z.infer<typeof setupFormSchema>;

export default function SetupPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<SetupFormValues>({
        resolver: zodResolver(setupFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
        },
    });

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    }

    function onSubmit(data: SetupFormValues) {
        // In a real app, you'd save this data to your backend.
        // For now, we'll just save a flag to local storage.
        localStorage.setItem('joblytics-setup-complete', 'true');
        localStorage.setItem('joblytics-user-profile', JSON.stringify(data));

        toast({
            title: "Profile Created!",
            description: "Welcome to Joblytics. Redirecting you now...",
        });
        setTimeout(() => router.push('/'), 1500);
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-lg">
                <Card className="neobrutal-shadow">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center">
                           <Briefcase className="h-8 w-8 mr-2 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-3xl">Welcome to Joblytics</CardTitle>
                        <CardDescription>
                            Let's get your profile set up.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-6">
                            <Avatar className="h-24 w-24 border-2">
                                <AvatarImage
                                src={avatarPreview}
                                alt="User profile"
                                width={96}
                                height={96}
                                data-ai-hint="person portrait"
                                />
                                <AvatarFallback>PIC</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-2">
                                <Button type="button" variant="outline" onClick={handleUploadClick}>Upload Photo</Button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Save and Continue</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    </div>
  );
}
