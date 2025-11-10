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
  new: "bg-gray-400 border-gray-400",
  APPLIED: "bg-blue-500 border-blue-500",
  INTERVIEW: "bg-yellow-500 border-yellow-500",
  PARTIALLY_CLEARED: "bg-orange-500 border-orange-500",
  WAITING: "bg-purple-500 border-purple-500",
  OFFER: "bg-green-500 border-green-500",
  REJECTED: "bg-red-500 border-red-500",
};

export function JobStatusRibbon() {
  const [status, setStatus] = useState("new");

  return (
    <div
      className={cn(
        "absolute top-0 right-0 h-10 w-40 overflow-hidden",
        "before:absolute before:top-0 before:left-0 before:border-4 before:border-transparent",
        "after:absolute after:bottom-0 after:right-0 after:border-4 after:border-transparent"
      )}
    >
      <div className="absolute top-0 left-0 w-full h-full">
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center text-white shadow-lg",
            "transform-gpu translate-x-8 translate-y-4 rotate-45",
            statusColors[status]
          )}
        >
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-auto h-6 p-1 border-0 bg-transparent text-white text-xs font-bold focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
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
    </div>
  );
}
