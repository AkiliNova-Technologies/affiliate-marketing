import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

// ─── Country codes ────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "256", label: "🇺🇬 UG" },
  { code: "254", label: "🇰🇪 KE" },
  { code: "255", label: "🇹🇿 TZ" },
  { code: "250", label: "🇷🇼 RW" },
  { code: "1",   label: "🇺🇸 US" },
  { code: "44",  label: "🇬🇧 GB" },
];

export default function PhoneField({
  phone, setPhone, cc, setCc,
}: {
  phone: string;
  setPhone: (v: string) => void;
  cc: string;
  setCc: (v: string) => void;
}) {
  const [ccOpen, setCcOpen] = useState(false);
  return (
    <div className="flex gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setCcOpen((v) => !v)}
          className="flex h-11 items-center gap-1.5 rounded-lg border border-gray-300 bg-background px-3 text-sm font-medium hover:border-[#F97316] transition-colors"
        >
          {cc} <IconChevronDown className="size-3 text-muted-foreground" />
        </button>
        {ccOpen && (
          <div className="absolute top-full left-0 z-20 mt-1 w-32 rounded-lg border bg-card shadow-lg py-1">
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setCc(c.code); setCcOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <Input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="eg 7748958996"
        className={cn(
          "h-11 flex-1 rounded-lg bg-white",
          phone ? "border-[#F97316] focus-visible:ring-[#F97316]" : "border-gray-300 focus-visible:ring-[#F97316]",
        )}
      />
    </div>
  );
}