import { Outlet, Link, useRouterState } from '@tanstack/react-router';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/process-explorer', label: 'Process Explorer' },
  { to: '/variant-explorer', label: 'Variant Explorer' },
  { to: '/throughput-time', label: 'Throughput Time' },
  { to: '/activity-search', label: 'Activity Search' },
  { to: '/simulation', label: 'Simulation' },
] as const;

export function RootLayout() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-[#1a1a2e] text-white px-4 py-2 flex items-center gap-6 shadow-md">
        <div className="font-bold text-lg mr-4 text-[#ff8c00]">
          Process Mining Explorer
        </div>
        {navItems.map((item) => {
          const isActive = currentPath === item.to ||
            (item.to !== '/' && currentPath.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm px-3 py-1.5 rounded transition-colors ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
