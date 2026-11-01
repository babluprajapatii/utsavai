/**
 * RFC 5545-compliant iCalendar (.ics) Generator for UtsavAI
 * Generates valid iCalendar files to import events and milestones
 * into Google Calendar, Apple Calendar, Microsoft Outlook, etc.
 */

export interface CalendarEventInput {
  id: string;
  name: string;
  description?: string;
  location?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
}

export interface CalendarMilestoneInput {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Calculates the next calendar day in YYYYMMDD format using UTC arithmetic.
 * Ensures YYYY-MM-DD stays correct regardless of client or server timezone.
 */
function getNextDayDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const [year, month, day] = parts;
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    utcDate.setUTCDate(utcDate.getUTCDate() + 1);
    return `${utcDate.getUTCFullYear()}${pad(utcDate.getUTCMonth() + 1)}${pad(utcDate.getUTCDate())}`;
  }
  return dateStr.replace(/-/g, "");
}

function formatDateToICS(dateStr: string, timeStr?: string): string {
  const cleanDate = dateStr.replace(/-/g, "");
  if (!timeStr) {
    // Value is DATE-only
    return `;VALUE=DATE:${cleanDate}`;
  }
  const [h, m] = timeStr.split(":").map(Number);
  return `:${cleanDate}T${pad(h || 0)}${pad(m || 0)}00`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Generates an RFC 5545-compliant .ics file content string.
 */
export function generateICS(
  event: CalendarEventInput,
  milestones: CalendarMilestoneInput[] = []
): string {
  const now = new Date();
  const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UtsavAI//Celebration Event Planning Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICSText(event.name)}`,
  ];

  // Main Event
  lines.push("BEGIN:VEVENT");
  lines.push(`UID:${event.id}-main@utsavai.com`);
  lines.push(`DTSTAMP:${dtStamp}`);
  lines.push(`DTSTART${formatDateToICS(event.date, event.startTime)}`);
  if (event.endTime) {
    lines.push(`DTEND${formatDateToICS(event.date, event.endTime)}`);
  } else if (!event.startTime) {
    // If date-only, RFC 5545 specifies DTEND is the next day for an all-day event
    const nextDay = getNextDayDate(event.date);
    lines.push(`DTEND;VALUE=DATE:${nextDay}`);
  }
  lines.push(`SUMMARY:${escapeICSText(event.name)}`);
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeICSText(event.location)}`);
  }
  lines.push("STATUS:CONFIRMED");
  lines.push("END:VEVENT");

  // Milestones
  for (const milestone of milestones) {
    if (!milestone.date) continue;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${milestone.id}-milestone@utsavai.com`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART${formatDateToICS(milestone.date)}`);
    // Date only end is next day
    const nextDay = getNextDayDate(milestone.date);
    lines.push(`DTEND;VALUE=DATE:${nextDay}`);
    lines.push(`SUMMARY:${escapeICSText(`[${event.name}] ${milestone.title}`)}`);
    if (milestone.description) {
      lines.push(`DESCRIPTION:${escapeICSText(milestone.description)}`);
    }
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  // RFC 5545 lines must be CRLF delimited
  return lines.join("\r\n");
}

/**
 * Triggers a browser download of an .ics file.
 */
export function downloadICSFile(filename: string, icsContent: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

