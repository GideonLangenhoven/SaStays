import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

type Language = {
  code: string;
  name: string;
};

const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "af", name: "Afrikaans" },
  { code: "zu", name: "Zulu" },
  { code: "xh", name: "isiXhosa" },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  if (!mounted) {
    return <div className="w-[80px] h-10" />; // Placeholder for SSR
  }

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger 
        className="w-auto h-10 border-none bg-transparent focus:ring-0 text-sm" 
        aria-label="Select Language"
      >
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent align="end" className="w-[140px]">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
            <span className="font-medium">{lang.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}