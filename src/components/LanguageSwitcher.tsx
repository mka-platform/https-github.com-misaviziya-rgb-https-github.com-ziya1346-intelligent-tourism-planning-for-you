import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";
import { SUPPORTED_LANGUAGES } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const displayName = (tag: string, language: string): string => {
  try {
    return new Intl.DisplayNames([language], { type: "language" }).of(tag) ?? tag;
  } catch {
    return tag;
  }
};

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = "" }: LanguageSwitcherProps) => {
  const { language, setLanguage, t } = useLanguage();

  const options = Array.from(new Set([...SUPPORTED_LANGUAGES, language]));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("nav.language")}
        data-testid="language-switcher"
        className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-normal smooth-hover hover:opacity-60 ${className}`}
      >
        <Globe className="h-3.5 w-3.5" />
        {language.split("-")[0]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[120] max-h-72 overflow-y-auto">
        {options.map((tag) => (
          <DropdownMenuItem
            key={tag}
            onSelect={() => setLanguage(tag)}
            className={tag === language ? "font-medium" : ""}
          >
            {displayName(tag, language)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
