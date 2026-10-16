import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://vkbuvisqrcspoihxujeb.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYnV2aXNxcmNzcG9paHh1amViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzY1ODksImV4cCI6MjEwNjc1MjU4OX0.4n39XfwM4gYewvs7IHeNRZsaglpPURKGyA4Rr-NCAmU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});