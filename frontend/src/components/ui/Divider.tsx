export function Divider({ label = 'atau' }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3.5 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      <span>{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
