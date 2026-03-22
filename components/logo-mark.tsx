export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-white/5 ${className}`}>
      <div className="absolute left-[7px] top-[6px] h-7 w-4 rounded-sm bg-blue-500" />
      <div
        className="absolute left-[16px] top-[5px] h-7 w-5 bg-white"
        style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
      />
    </div>
  );
}
