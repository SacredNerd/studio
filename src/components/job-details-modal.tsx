
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
import { Separator } from "@/components/ui/separator";
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
      <DialogContent className="max-w-[90vw] md:max-w-[70vw] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-none border-2 bg-muted flex-shrink-0">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-headline">{job.title}</DialogTitle>
              <DialogDescription className="text-lg">{job.companyName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-6 pb-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-md text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 flex-shrink-0" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 flex-shrink-0" />
                  <span>{job.postedDate}</span>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 font-headline">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 font-headline">Job Description</h3>
                <div className="text-base leading-relaxed text-foreground/80 prose">
                  <p>{job.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 border-2 rounded-none bg-muted/30">
                <h3 className="text-lg font-semibold font-headline">Application Details</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select defaultValue="INTERVIEW">
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
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
                        <Label htmlFor="contact-number">Contact Number</Label>
                        <Input id="contact-number" placeholder="123-456-7890" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact-email">Contact Email</Label>
                        <Input id="contact-email" type="email" placeholder="recruiter@neocorp.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="interview-date">Interview Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 border-t-2 bg-background sticky bottom-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
