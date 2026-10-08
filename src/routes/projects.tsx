import { createFileRoute } from '@tanstack/react-router';
import { ReposHub } from '@/components/onyx/ReposHub';
import { moduleHead } from '@/lib/module-head';
export const Route = createFileRoute('/projects')({ head: () => moduleHead('Projects & Architecture', 'OnyxCore lab repository branches, pipeline health, pull requests and commit activity.'), component: ReposHub });
