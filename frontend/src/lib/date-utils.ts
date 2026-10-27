// Lightweight date formatting to avoid pulling full date-fns locale bundle.
// Mirrors a subset of date-fns format tokens we need.

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function pad(n: number, len = 2) {
  return n.toString().padStart(len, "0");
}

export function dateFnsFormat(date: Date, format: string): string {
  return format.replace(/([a-z])\1*/gi, (token) => {
    const first = token[0];
    const len = token.length;
    switch (first) {
      case "y":
        if (len === 2) return pad(date.getFullYear() % 100);
        return date.getFullYear().toString();
      case "M":
        if (len === 1) return (date.getMonth() + 1).toString();
        if (len === 2) return pad(date.getMonth() + 1);
        if (len === 3) return MONTHS_SHORT[date.getMonth()];
        return MONTHS_LONG[date.getMonth()];
      case "d":
        if (len === 1) return date.getDate().toString();
        if (len === 2) return pad(date.getDate());
        return pad(date.getDate(), 2);
      case "E":
        if (len <= 3) return DAYS_SHORT[date.getDay()];
        return DAYS_LONG[date.getDay()];
      case "H":
        if (len === 1) return date.getHours().toString();
        return pad(date.getHours());
      case "h": {
        const h12 = date.getHours() % 12 || 12;
        if (len === 1) return h12.toString();
        return pad(h12);
      }
      case "m":
        if (len === 1) return date.getMinutes().toString();
        return pad(date.getMinutes());
      case "a":
        return date.getHours() >= 12 ? "PM" : "AM";
      default:
        return token;
    }
  });
}
