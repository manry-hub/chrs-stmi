import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DateFilterRange = "hari" | "bulan" | "tahun" | "semua";

export function isWithinDateRange(dateInput: any, range: DateFilterRange): boolean {
  if (!dateInput) return false;
  if (range === "semua") return true;

  let date: Date;
  if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else if (typeof dateInput?.toDate === "function") {
    date = dateInput.toDate();
  } else if (dateInput?.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return false;
  }

  if (isNaN(date.getTime())) return false; // Invalid date

  const now = new Date();
  
  if (range === "hari") {
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  if (range === "bulan") {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  if (range === "tahun") {
    return date.getFullYear() === now.getFullYear();
  }

  return true;
}

