import Link from "next/link";
import { Activity, Bell, BookmarkCheck, LayoutDashboard } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist", icon: BookmarkCheck },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Activity className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">PoolSignal</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Solana SOL/USDC scanner
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
