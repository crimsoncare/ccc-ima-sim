import { Outlet, Link, useRouterState } from '@tanstack/react-router';
import { OnboardingGuide } from '@/components/shared/OnboardingGuide';

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
      <nav className="bg-[#1a1a2e] text-white px-6 flex items-center gap-1 shadow-lg border-b border-white/10">
        <div className="font-bold text-lg mr-6 py-3 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8c00" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
          <span className="text-white">CCC-IMA</span>
        </div>
        {navItems.map((item) => {
          const isActive = currentPath === item.to ||
            (item.to !== '/' && currentPath.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm px-3 py-3 transition-colors border-b-2 ${
                isActive
                  ? 'border-[#ff8c00] text-white font-medium'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <OnboardingGuide />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
