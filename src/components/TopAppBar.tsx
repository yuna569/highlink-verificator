type TopAppBarProps = {
  title: string;
};

export default function TopAppBar({ title }: TopAppBarProps) {
  return (
    <header className="ml-sidebar-width sticky top-0 z-40 flex w-[calc(100%-var(--spacing-sidebar-width))] items-center justify-between border-b border-border-subtle bg-surface-canvas px-xl py-md">
      <h2 className="text-h2 font-black text-charcoal">{title}</h2>
    </header>
  );
}
