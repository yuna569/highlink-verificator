import MaterialIcon from "./MaterialIcon";

type TopAppBarProps = {
  title: string;
  onMenuClick?: () => void;
};

export default function TopAppBar({ title, onMenuClick }: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-border-subtle bg-surface-canvas px-xl py-md md:ml-sidebar-width md:w-[calc(100%-var(--spacing-sidebar-width))]">
      {onMenuClick && (
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuClick}
          className="mr-sm text-charcoal md:hidden"
        >
          <MaterialIcon name="menu" />
        </button>
      )}
      <h2 className="text-h2 font-black text-charcoal">{title}</h2>
    </header>
  );
}
