import { useRef, useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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
import { Briefcase, Loader2 } from "lucide-react";
import { api } from "@/services/api";

const setupFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
});

type SetupFormValues = z.infer<typeof setupFormSchema>;

export default function SetupPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPending, startTransition] = useTransition();

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
        startTransition(async () => {
            try {
                // Mock API call
                await api.saveUser({
                    ...data,
                    avatar: avatarPreview
                });

                toast({
                    title: "Profile Created!",
                    description: "Welcome to Job.Hunt. Redirecting you now...",
                });
                navigate('/');
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "Could not create profile.",
                });
            }
        });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-lg">
                    <Card className="border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-card">
                        <CardHeader className="text-center border-b-3 border-black dark:border-white bg-secondary/20 dark:bg-secondary/10 pb-6">
                            <div className="mx-auto mb-4 flex items-center justify-center p-3 border-2 border-black dark:border-white bg-white dark:bg-card shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] w-16 h-16">
                                <Briefcase className="h-8 w-8 text-black dark:text-white" />
                            </div>
                            <CardTitle className="font-headline font-black text-3xl uppercase tracking-tight dark:text-white">Welcome to Job.Hunt</CardTitle>
                            <CardDescription className="text-black/70 dark:text-white/70 font-medium font-body text-lg">
                                Let's get your profile set up.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-8 px-8">
                            <div className="flex flex-col items-center gap-6">
                                <Avatar className="h-28 w-28 rounded-none border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                    <AvatarImage
                                        src={avatarPreview}
                                        alt="User profile"
                                        width={112}
                                        height={112}
                                        data-ai-hint="person portrait"
                                    />
                                    <AvatarFallback className="rounded-none font-headline font-black text-2xl bg-accent text-white">PIC</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-2">
                                    <Button type="button" variant="outline" onClick={handleUploadClick} className="border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all dark:text-white dark:bg-card">Upload Photo</Button>
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
                                            <FormLabel className="font-bold text-base dark:text-white">First Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus-visible:ring-0 focus-visible:ring-offset-0 bg-white dark:bg-card dark:text-white placeholder:text-gray-400 font-medium" />
                                            </FormControl>
                                            <FormMessage className="font-bold text-destructive" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-base dark:text-white">Last Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus-visible:ring-0 focus-visible:ring-offset-0 bg-white dark:bg-card dark:text-white placeholder:text-gray-400 font-medium" />
                                            </FormControl>
                                            <FormMessage className="font-bold text-destructive" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-base dark:text-white">Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus-visible:ring-0 focus-visible:ring-offset-0 bg-white dark:bg-card dark:text-white placeholder:text-gray-400 font-medium" />
                                        </FormControl>
                                        <FormMessage className="font-bold text-destructive" />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="pb-8 px-8">
                            <Button type="submit" className="w-full h-12 bg-primary text-white border-2 border-black dark:border-white shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none font-headline font-black text-lg uppercase tracking-wide" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Save and Continue
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
