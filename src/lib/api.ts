import { supabase } from './supabase';
export async function teamApi<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
 const { data, error } = await supabase.functions.invoke('team-api', { body: { action, ...payload } });
 if (error) {
  let message = error.message;
  if ('context' in error && error.context instanceof Response) { try { message = (await error.context.json()).error || message; } catch { /* use the original error */ } }
  throw new Error(message);
 }
 if (data?.error) throw new Error(data.error);
 return data as T;
}