import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ModuleEmptyState({
  title,
  description,
  ctaLabel,
  ctaHref = "/",
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-8 text-center">
      <div className="text-2xl font-semibold text-white">{title}</div>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
      <div className="mt-6">
        <Link href={ctaHref}>
          <Button>{ctaLabel}</Button>
        </Link>
      </div>
    </div>
  );
}
