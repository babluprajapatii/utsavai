import { dateFnsFormat } from "./date-utils";

export function formatINR(amount: number, opts?: { compact?: boolean }) {
  if (opts?.compact && Math.abs(amount) >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs.toLocaleString("en-IN", {
      maximumFractionDigits: 1,
    })} L`;
  }
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatINRShort(amount: number) {
  return formatINR(amount, { compact: true });
}

export function formatDate(
  date: string | Date,
  format: "long" | "short" | "medium" = "medium"
) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (format === "long") {
    return dateFnsFormat(d, "EEEE, d MMMM yyyy");
  }
  if (format === "short") {
    return dateFnsFormat(d, "d MMM yyyy");
  }
  return dateFnsFormat(d, "d MMMM yyyy");
}

export function formatDateISO(date: Date) {
  return dateFnsFormat(date, "yyyy-MM-dd");
}

export function formatTime(time: string) {
  // Input "HH:MM" -> "h:mm AM/PM"
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatTimeRange(start: string, end?: string) {
  if (!end) return formatTime(start);
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function daysUntil(date: string | Date): number {
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  // Strip time
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((t.getTime() - n.getTime()) / (1000 * 60 * 60 * 24));
}

export function relativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return formatDate(date, "short");
}

export function classNames(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
