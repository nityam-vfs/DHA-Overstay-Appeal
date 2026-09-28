import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-ZA", { day: "2-digit", month: "2-digit", year: "numeric" })}, ${d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`;
}

export function formatZar(amount: number) {
  return `ZAR ${amount.toLocaleString("en-ZA")}`;
}
