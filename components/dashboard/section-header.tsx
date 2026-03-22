export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{description}</p>
    </div>
  );
}
