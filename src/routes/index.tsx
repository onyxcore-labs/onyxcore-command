import { createFileRoute } from '@tanstack/react-router';
import { Objectives } from '@/components/onyx/Objectives';
import { moduleHead } from '@/lib/module-head';
export const Route = createFileRoute('/')({
  head: () => moduleHead('My Objectives', 'Personalized sprint focus, progress, milestones and live squad pulse for OnyxCore founders.'),
  component: Objectives,
});
