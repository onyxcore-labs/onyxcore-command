import { createFileRoute } from '@tanstack/react-router';
import { Radar } from '@/components/onyx/Radar';
import { moduleHead } from '@/lib/module-head';
export const Route = createFileRoute('/radar')({ head: () => moduleHead('Social Radar & Ideas', 'Share opportunities, explore social links and vote on the next OnyxCore lab sprint.'), component: Radar });
