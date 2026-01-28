"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "./I18nProvider";
import { LOCALE_OPTIONS, type Locale } from "@/lib/i18n";

// Language display names and flags (using Unicode regional indicators)
const LANGUAGE_LABELS: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  "en": { name: "English", nativeName: "English", flag: "🇬🇧" },
  "zh-CN": { name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳" },
  "zh-TW": { name: "Chinese (Traditional)", nativeName: "繁體中文", flag: "🇹🇼" },
  "ja": { name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  "ko": { name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  "de": { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  "es": { name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  "fr": { name: "French", nativeName: "Français", flag: "🇫🇷" },
  "pt": { name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  "ru": { name: "Russian", nativeName: "Русский", flag: "🇷🇺" }
};

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const currentLang = LANGUAGE_LABELS[locale];

  const handleSelect = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2
          px-3 py-2
          rounded-lg
          bg-background-secondary
          border border-border
          text-foreground
          text-sm font-medium
          hover:bg-card hover:border-border-hover
          transition-colors duration-200
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
          min-w-[44px] min-h-[44px]
        "
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Flag */}
        <span className="text-xl leading-none" aria-hidden="true">
          {currentLang.flag}
        </span>

        {/* Language Code - Hidden on mobile, shown on tablet+ */}
        <span className="hidden sm:inline">
          {currentLang.nativeName}
        </span>

        {/* Chevron Icon */}
        <svg
          className={`
            w-4 h-4
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Language options"
          className="
            absolute right-0 top-[calc(100%+0.5rem)]
            w-64
            bg-card
            border border-border
            rounded-xl
            shadow-xl
            overflow-hidden
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          "
        >
          {/* Scrollable container */}
          <div className="max-h-[320px] overflow-y-auto overscroll-contain">
            {LOCALE_OPTIONS.map((option) => {
              const lang = LANGUAGE_LABELS[option.locale];
              const isSelected = option.locale === locale;

              return (
                <button
                  key={option.locale}
                  onClick={() => handleSelect(option.locale)}
                  role="option"
                  aria-selected={isSelected}
                  className={`
                    w-full
                    flex items-center gap-3
                    px-4 py-3
                    text-left
                    transition-colors duration-150
                    cursor-pointer
                    min-h-[44px]
                    ${
                      isSelected
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-foreground hover:bg-background-secondary'
                    }
                  `}
                >
                  {/* Flag */}
                  <span className="text-2xl leading-none shrink-0" aria-hidden="true">
                    {lang.flag}
                  </span>

                  {/* Language Names */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {lang.name}
                    </div>
                  </div>

                  {/* Check Icon for selected */}
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-accent shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
