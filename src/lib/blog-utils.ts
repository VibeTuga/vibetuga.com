const PT_MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function formatDatePT(date: Date | null): string {
  if (!date) return "";
  return `${date.getDate().toString().padStart(2, "0")} ${PT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

type AccentConfig = {
  barBg: string;
  dotBg: string;
  hoverText: string;
  hoverShadow: string;
  avatarBorder: string;
  categoryBorder: string;
  categoryText: string;
  categoryHover: string;
};

const ACCENT_MAP: Record<string, AccentConfig> = {
  primary: {
    barBg: "bg-primary",
    dotBg: "bg-primary",
    hoverText: "group-hover:text-primary",
    hoverShadow: "hover:shadow-[0_10px_40px_-10px_rgba(161,255,194,0.15)]",
    avatarBorder: "border-primary/30",
    categoryBorder: "border-primary/20",
    categoryText: "text-primary",
    categoryHover: "hover:bg-primary/10",
  },
  secondary: {
    barBg: "bg-secondary",
    dotBg: "bg-secondary",
    hoverText: "group-hover:text-secondary",
    hoverShadow: "hover:shadow-[0_10px_40px_-10px_rgba(216,115,255,0.15)]",
    avatarBorder: "border-secondary/30",
    categoryBorder: "border-secondary/20",
    categoryText: "text-secondary",
    categoryHover: "hover:bg-secondary/10",
  },
  tertiary: {
    barBg: "bg-tertiary",
    dotBg: "bg-tertiary",
    hoverText: "group-hover:text-tertiary",
    hoverShadow: "hover:shadow-[0_10px_40px_-10px_rgba(129,233,255,0.15)]",
    avatarBorder: "border-tertiary/30",
    categoryBorder: "border-tertiary/20",
    categoryText: "text-tertiary",
    categoryHover: "hover:bg-tertiary/10",
  },
};

const DEFAULT_ACCENT = ACCENT_MAP.primary;

export function getCategoryAccent(color: string | null): AccentConfig {
  if (!color) return DEFAULT_ACCENT;

  const hex = color.replace("#", "");
  if (hex.length !== 6) return DEFAULT_ACCENT;

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;

  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  const hue = h * 360;

  if (hue >= 80 && hue < 180) return ACCENT_MAP.primary;
  if (hue >= 180 && hue < 280) return ACCENT_MAP.tertiary;
  if (hue >= 280 || hue < 20) return ACCENT_MAP.secondary;

  return DEFAULT_ACCENT;
}

export { type AccentConfig };
