import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type Row<T extends keyof Tables> = Tables[T]["Row"];

/** Loads a table and keeps it in sync via realtime. */
export function useLiveTable<T extends keyof Tables>(table: T, order: string, ascending = true) {
  const [rows, setRows] = useState<Row<T>[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from(table).select("*").order(order, { ascending });
    if (data) setRows(data as unknown as Row<T>[]);
  }, [table, order, ascending]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`live-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [table, load]);

  return { rows, setRows, reload: load };
}
