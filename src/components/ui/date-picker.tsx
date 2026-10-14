"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  id,
  value,
  onChange,
  disableFuture = false,
}: {
  id?: string;
  value?: Date;
  onChange?: (date?: Date) => void;
  disableFuture?: boolean;
}) {
  const today = new Date();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            id={id}
            data-empty={!value}
            className="data-[empty=true]:text-muted-foreground h-9 w-full justify-start text-left font-normal"
          />
        }
      >
        <CalendarIcon />
        {value ? format(value, "PPP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disableFuture ? { after: today } : undefined}
          endMonth={disableFuture ? today : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
