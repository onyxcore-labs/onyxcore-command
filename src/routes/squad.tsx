import { createFileRoute } from '@tanstack/react-router';
import { SquadSync } from '@/components/onyx/SquadSync';
import { moduleHead } from '@/lib/module-head';
export const Route = createFileRoute('/squad')({ head: () => moduleHead('Squad Sync & Blockers', 'Live founder presence, sprint progress and blockers across the four-person OnyxCore team.'), component: SquadSync });
