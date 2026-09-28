export function SaFlagMark({ className }: { className?: string }) {
  return (
    <div className={`flex h-6 w-9 flex-col overflow-hidden rounded-sm border border-gray-200 ${className ?? ""}`}>
      <div className="h-1/4 bg-[#E03C31]" />
      <div className="h-1/4 bg-white" />
      <div className="h-1/4 bg-[#007A4D]" />
      <div className="h-1/4 bg-[#001489]" />
    </div>
  );
}
