'use client';

import { useEffect } from 'react';

export function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [msg, onClose]);

  if (!msg) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex justify-center px-4 sm:bottom-8"
    >
      <div className="toast-in rounded-xl bg-ink px-4 py-2.5 text-[13.5px] font-medium text-white shadow-lift">
        {msg}
      </div>
    </div>
  );
}
