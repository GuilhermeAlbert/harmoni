"use client";

import Image from "next/image";

import type { BrandProps } from "./types";
import { useLanguage } from "@/contexts/language/use-language";

export function Brand({ compact = false }: BrandProps): React.ReactNode {
  const { messages } = useLanguage();

  return (
    <span className="inline-flex items-center gap-3">
      <Image
        alt={messages.brand.imageAlt}
        className="size-10 rounded-xl border border-zinc-200 object-cover dark:border-white/10"
        height={40}
        priority
        src="/images/maestro.png"
        unoptimized
        width={40}
      />
      {compact ? null : (
        <span>
          <span className="block font-[family-name:var(--font-geist)] text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Harmoni
          </span>
          <span className="mt-0.5 block text-xs text-zinc-500">
            {messages.brand.subtitle}
          </span>
        </span>
      )}
    </span>
  );
}
