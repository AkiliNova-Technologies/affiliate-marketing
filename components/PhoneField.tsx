import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COUNTRY_CODES = [
  { code: "256", label: "+256" },
  { code: "254", label: "+254" },
  { code: "255", label: "+255" },
  { code: "250", label: "+250" },
  { code: "1",   label: "+1" },
  { code: "44",  label: "+44" },
];

export default function PhoneField({
  phone,
  setPhone,
  cc,
  setCc,
  disabled = false,
}: {
  phone: string;
  setPhone: (v: string) => void;
  cc: string;
  setCc: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <Select value={cc} onValueChange={setCc} disabled={disabled}>
        <SelectTrigger className="min-h-11 w-[110px] rounded-md border-gray-300 bg-white focus:border-orange-400 focus:ring-orange-400">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="eg 7748958996"
        disabled={disabled}
        className={cn(
          "h-11 flex-1 rounded-md bg-white",
          phone
            ? "border-orange-400 focus-visible:ring-orange-400"
            : "border-gray-300 focus-visible:ring-orange-400",
        )}
      />
    </div>
  );
}