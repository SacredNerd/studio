"use client";

import { useRef, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function UpdateProfileForm() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');
    const [avatarPreview, setAvatarPreview] = useState(userAvatar?.imageUrl || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <Card className="neobrutal-shadow">
      <CardHeader>
        <CardTitle className="font-headline">Update Profile</CardTitle>
        <CardDescription>
          This is how your name will be displayed in the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border-2">
            <AvatarImage
              src={avatarPreview}
              alt="User profile"
              width={80}
              height={80}
              data-ai-hint="person portrait"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={handleUploadClick}>Change Photo</Button>
            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
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
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" defaultValue="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" defaultValue="Doe" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" defaultValue="john.doe@example.com" />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button>Update Profile</Button>
      </CardFooter>
    </Card>
  );
}
