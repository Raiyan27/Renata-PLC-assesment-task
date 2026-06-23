import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type TimeFormat = "h_m" | "decimal";
type DateFormat = "dd_mmm_yy" | "dd_mm_yyyy";

interface FormatContextType {
  timeFormat: TimeFormat;
  setTimeFormat: (fmt: TimeFormat) => void;
  dateFormat: DateFormat;
  setDateFormat: (fmt: DateFormat) => void;
  formatTime: (val: number | string) => string;
  formatDate: (val: string) => string;
}

const FormatContext = createContext<FormatContextType | undefined>(undefined);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function FormatProvider({ children }: { children: ReactNode }) {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("h_m");
  const [dateFormat, setDateFormat] = useState<DateFormat>("dd_mmm_yy");

  const formatTime = (val: number | string) => {
    const hours = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(hours)) return "0h";
    
    if (timeFormat === "decimal") {
      return `${hours.toFixed(1)}h`;
    } else {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      if (h === 0 && m === 0) return "0m";
      if (h === 0) return `${m}m`;
      if (m === 0) return `${h}h`;
      return `${h}h ${m}m`;
    }
  };

  const formatDate = (val: string) => {
    const parts = val.split("-");
    if (parts.length !== 3) return val;
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    if (dateFormat === "dd_mm_yyyy") {
      return `${day}-${month}-${year}`;
    }
    const shortYear = year.slice(2);
    const monthIdx = parseInt(month, 10) - 1;
    const monthName = monthIdx >= 0 && monthIdx < 12 ? MONTHS[monthIdx] : month;
    return `${day}-${monthName}-${shortYear}`;
  };

  return (
    <FormatContext.Provider value={{ timeFormat, setTimeFormat, dateFormat, setDateFormat, formatTime, formatDate }}>
      {children}
    </FormatContext.Provider>
  );
}

export function useFormat() {
  const ctx = useContext(FormatContext);
  if (!ctx) throw new Error("useFormat must be used within FormatProvider");
  return ctx;
}
