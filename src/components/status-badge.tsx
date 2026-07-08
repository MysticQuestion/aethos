import { cn } from "@/lib/utils";

const tones = {
  agreement: "border-[rgba(15,118,110,0.28)] bg-[rgba(15,118,110,0.1)] text-[var(--teal)]",
  tension: "border-[rgba(161,98,7,0.3)] bg-[rgba(161,98,7,0.11)] text-[var(--ochre)]",
  paradox: "border-[rgba(143,45,86,0.3)] bg-[rgba(143,45,86,0.11)] text-[var(--wine)]",
  mixed: "border-[rgba(98,82,163,0.3)] bg-[rgba(98,82,163,0.11)] text-[var(--violet)]",
  neutral: "border-[var(--line)] bg-[rgba(237,232,220,0.45)] text-[var(--ink-soft)]"
};

export function StatusBadge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span className={cn("inline-flex min-h-7 items-center rounded-md border px-2.5 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
