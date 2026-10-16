import { useMemo } from 'react';
import { memberFromRow } from '@/lib/founders';
import { useLiveTable } from './useLiveTable';

/** Live team list (founders plus approved members). */
export function useTeam() {
  const { rows, reload } = useLiveTable('founder_status', 'full_name');
  const team = useMemo(() => rows.map(memberFromRow), [rows]);
  return { team, rows, reload };
}
