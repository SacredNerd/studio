"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const statusColors: { [key: string]: string } = {
  new: "bg-gray-400",
  APPLIED: "bg-blue-500",
  INTERVIEW: "bg-yellow-500",
  PARTIALLY_CLEARED: "bg-orange-500",
  WAITING: "bg-purple-500",
  OFFER: "bg-green-500",
  REJECTED: "bg-red-500",
};

export function JobStatusRibbon() {
  const [status, setStatus] = useState("new");

  return (
    <div className="absolute top-2 -right-11 z-10">
      <div
        className={cn(
          "w-40 h-8 transform rotate-45 flex items-center justify-center text-white text-xs font-bold shadow-lg",
          statusColors[status]
        )}
      >
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-auto h-6 p-1 border-0 bg-transparent text-white focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-0">
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="APPLIED">APPLIED</SelectItem>
            <SelectItem value="INTERVIEW">INTERVIEW</SelectItem>
            <SelectItem value="PARTIALLY_CLEARED">PARTIALLY CLEARED</SelectItem>
            <SelectItem value="WAITING">WAITING</SelectItem>
            <SelectItem value="OFFER">OFFER</SelectItem>
            <SelectItem value="REJECTED">REJECTED</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
