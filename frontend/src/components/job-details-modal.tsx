
"use client";

import type { Job } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  CalendarDays,
  DollarSign,
  Building2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";


interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

export function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Details Saved",
      description: "Your application details have been updated.",
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] md:max-w-[70vw] h-[85vh] max-h-[85vh] flex flex-col p-0 border-3 border-black dark:border-white shadow-neobrutal-lg dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none sm:rounded-none bg-white dark:bg-card lg:max-w-4xl">
        <DialogHeader className="p-6 pb-4 border-b-3 border-black dark:border-white bg-white dark:bg-card shrink-0">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-none border-3 border-black dark:border-white bg-secondary dark:bg-secondary/80 shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex-shrink-0">
              <Building2 className="h-8 w-8 text-black" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-headline font-bold text-black dark:text-white uppercase tracking-tight">{job.title}</DialogTitle>
              <DialogDescription className="text-xl font-medium text-black/70 dark:text-white/70 mt-1">{job.companyName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background scrollbar-thin scrollbar-thumb-black dark:scrollbar-thumb-white scrollbar-track-transparent">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-full">
            {/* Left Column: Job Details */}
            <div className="lg:col-span-2 p-6 space-y-8 bg-slate-50 dark:bg-background">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border-2 border-black dark:border-white bg-white dark:bg-card shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <MapPin className="h-5 w-5 text-primary dark:text-primary-foreground" />
                  <span className="font-bold text-sm truncate dark:text-white" title={job.location}>{job.location}</span>
                </div>
                <div className="flex items-center gap-3 p-3 border-2 border-black dark:border-white bg-white dark:bg-card shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-bold text-sm truncate dark:text-white" title={job.salary}>{job.salary}</span>
                </div>
                <div className="flex items-center gap-3 p-3 border-2 border-black dark:border-white bg-white dark:bg-card shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-sm truncate dark:text-white">{job.postedDate}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-headline font-black uppercase mb-4 border-b-3 border-black dark:border-white inline-block dark:text-white">Required Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm px-4 py-1.5 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] bg-accent text-white hover:translate-y-[2px] hover:shadow-none transition-all">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-headline font-black uppercase mb-4 border-b-3 border-black dark:border-white inline-block dark:text-white">Job Description</h3>
                <div className="text-base leading-relaxed text-black/90 dark:text-white/90 prose max-w-none font-medium text-justify">
                  <p>{job.description}</p>
                  {/* Adding filler text to demonstrate scrolling if description is short */}
                  <p className="mt-4">
                    This position requires a deep understanding of modern web technologies and a passion for creating intuitive user experiences.
                    You will work closely with cross-functional teams to design, build, and maintain scalable applications.
                    We value creativity, ownership, and a growth mindset. If you are ready to take on new challenges and make an impact, we'd love to hear from you.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Application Management - Sticky on LG screens within the column if needed, or just static */}
            <div className="lg:col-span-1 p-6 bg-secondary/20 dark:bg-secondary/10 border-l-3 border-black dark:border-white space-y-6">
              <div className="bg-white dark:bg-card p-5 border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <h3 className="text-lg font-headline font-black uppercase mb-6 flex items-center gap-2 dark:text-white">
                  <span className="w-3 h-3 bg-primary rounded-full border border-black dark:border-white"></span>
                  Manage App
                </h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-bold text-base dark:text-white">Status</Label>
                    <Select defaultValue="INTERVIEW">
                      <SelectTrigger id="status" className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus:ring-0 focus:ring-offset-0 bg-white dark:bg-card dark:text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-card dark:text-white">
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="INTERVIEW">Interview Scheduled</SelectItem>
                        <SelectItem value="PARTIALLY_CLEARED">Partially Cleared</SelectItem>
                        <SelectItem value="WAITING">Waiting</SelectItem>
                        <SelectItem value="OFFER">Offer</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-number" className="font-bold text-base dark:text-white">Contact Number</Label>
                    <Input id="contact-number" placeholder="123-456-7890" className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus-visible:ring-0 focus-visible:ring-offset-0 bg-white dark:bg-card dark:text-white placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="font-bold text-base dark:text-white">Contact Email</Label>
                    <Input id="contact-email" type="email" placeholder="hr@company.com" className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus-visible:ring-0 focus-visible:ring-offset-0 bg-white dark:bg-card dark:text-white placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interview-date" className="font-bold text-base dark:text-white">Interview Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 justify-start text-left font-medium border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-[0.98] bg-white dark:bg-card dark:text-white",
                            !date && "text-muted-foreground dark:text-gray-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-2 border-black dark:border-white rounded-none shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-card dark:text-white">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className="not-prose"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t-3 border-black dark:border-white bg-white dark:bg-card shrink-0 z-50 flex-row gap-3 justify-end shadow-[0_-4px_0_0_rgba(0,0,0,0.1)]">
          <Button variant="ghost" onClick={onClose} className="h-11 px-6 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none font-bold dark:text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} className="h-11 px-8 bg-primary text-white border-2 border-black dark:border-white shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none font-bold text-md">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
