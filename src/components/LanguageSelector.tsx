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
  flag: string;
};

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦" },
  { code: "zu", name: "Zulu", flag: "🇿🇦" },
  { code: "xh", name: "isiXhosa", flag: "🇿🇦" },
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
        <div className="flex items-center gap-2">
          <span>{languages.find(l => l.code === language)?.flag}</span>
          <SelectValue placeholder="Language" />
        </div>
      </SelectTrigger>
      <SelectContent align="end" className="w-[180px]">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}