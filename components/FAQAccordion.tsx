'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FAQAccordion (§8): accessible disclosure list. Each item is a button with
 * aria-expanded controlling a region; keyboard-operable by default.
 */
export function FAQAccordion({
  items,
  className,
}: {
  items: { q: string; a: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn('divide-y divide-teal/10 border-y border-teal/10', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `faq-panel-${i}`;
        const btnId = `faq-btn-${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left font-sans text-body-lg font-medium text-teal hover:text-teal-80"
              >
                {item.q}
                <ChevronDown
                  size={20}
                  className={cn(
                    'shrink-0 text-terracotta transition-transform duration-300 ease-calm',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="pb-6 pr-8 text-body text-ink-soft"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
