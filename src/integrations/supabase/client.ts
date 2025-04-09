
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qrsruxdozpccgxosulqt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyc3J1eGRvenBjY2d4b3N1bHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNTQwMzIsImV4cCI6MjA1NjgzMDAzMn0.MIw16Mb-Q0KkojJrhkdD0nR_6Sy-PaIZL4CQM79nGnk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
