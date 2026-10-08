import { createFileRoute } from '@tanstack/react-router';
import { Inventory } from '@/components/onyx/Inventory';
import { moduleHead } from '@/lib/module-head';
export const Route = createFileRoute('/hardware')({ head: () => moduleHead('Hardware Inventory', 'OnyxCore laboratory components, testbed specifications, stock and founder allocations.'), component: Inventory });
