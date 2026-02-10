import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, LogOut, Settings } from 'lucide-react';
import { api } from '@/services/api';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';



export function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.getUser().then(setUser);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b-3 border-black dark:border-white bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="mr-8 flex items-center">
          <div className="h-10 w-10 bg-primary border-2 border-black dark:border-white shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center mr-3">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <Link to="/" className="font-headline font-black text-2xl text-foreground uppercase tracking-tighter">
            Job.Hunt
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-bold">
          <Link
            to="/"
            className="transition-colors hover:text-foreground text-foreground/80 hover:underline decoration-2 underline-offset-4 uppercase tracking-wide"
          >
            Dashboard
          </Link>
          <Link
            to="/jobs"
            className="transition-colors hover:text-foreground text-foreground/80 hover:underline decoration-2 underline-offset-4 uppercase tracking-wide"
          >
            Jobs
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-none border-2 border-black dark:border-white shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] p-0 hover:translate-y-[2px] hover:shadow-none transition-all">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage
                      src={user.avatar || undefined}
                      alt="User profile"
                      width={40}
                      height={40}
                      data-ai-hint="person portrait"
                    />
                    <AvatarFallback className="rounded-none font-bold bg-secondary text-black">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-none border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-card dark:text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal bg-secondary/20 dark:bg-secondary/10 border-b-2 border-black dark:border-white p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none font-headline">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground font-medium">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className="focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-black dark:focus:text-white font-medium cursor-pointer rounded-none m-1">
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                <DropdownMenuItem className="focus:bg-destructive focus:text-white font-medium cursor-pointer rounded-none m-1">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
