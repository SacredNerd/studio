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
  new: "bg-gray-500",
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
    <div
      className={cn(
        "absolute top-0 left-0 z-10 w-32 text-white text-xs font-bold",
      )}
    >
      <div className={cn("relative w-full h-8 overflow-hidden", statusColors[status])}
        style={{
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'
        }}>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger
            className="w-full h-full p-0 m-0 border-0 bg-transparent text-white text-xs font-bold focus:ring-0 focus:ring-offset-0 [&>svg]:ml-auto [&>svg]:mr-2 pl-2"
          >
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
      <div className="absolute top-0 left-0 w-1 h-1 bg-blue-700" style={{transform: 'translateY(32px) translateX(0px)', zIndex: -1}} />
    </div>
  );
}
