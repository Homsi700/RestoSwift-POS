
"use client"

import * as React from "react"
import { format } from "date-fns"
import { arEG } from "date-fns/locale" // Import Arabic locale for date-fns
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ date, setDate, placeholder = "اختر تاريخًا", disabled }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="ml-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: arEG }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" dir="rtl">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          dir="rtl"
          locale={arEG} // Pass locale to Calendar
        />
      </PopoverContent>
    </Popover>
  )
}
