import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { RootLayout } from './routes/__root';
import { IndexPage } from './routes/index';
import { ProcessExplorerPage } from './routes/process-explorer';
import { VariantExplorerPage } from './routes/variant-explorer';
import { ThroughputTimePage } from './routes/throughput-time';
import { ActivitySearchPage } from './routes/activity-search';
import { SimulationPage } from './routes/simulation';

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
});

const processExplorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/process-explorer',
  component: ProcessExplorerPage,
});

const variantExplorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/variant-explorer',
  component: VariantExplorerPage,
});

const throughputTimeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/throughput-time',
  component: ThroughputTimePage,
});

const activitySearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activity-search',
  component: ActivitySearchPage,
});

const simulationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/simulation',
  component: SimulationPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  processExplorerRoute,
  variantExplorerRoute,
  throughputTimeRoute,
  activitySearchRoute,
  simulationRoute,
]);
