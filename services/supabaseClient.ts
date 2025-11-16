import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// This environment does not support .env files for Supabase credentials.
// You must replace the placeholder values below with your actual Supabase project URL and anon key.
// You can find these keys in your Supabase project settings under "API".
// The application will fail to load data if these are not set correctly.
const supabaseUrl = 'https://dtlipycorweyfrsgomry.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bGlweWNvcndleWZyc2dvbXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjkzOTksImV4cCI6MjA3ODA0NTM5OX0.TH7gABKi0B2KXYqoHvacFgM4MgLTAr2hVBw0tzksMpU';

// The error "Invalid API key" might appear in the console if the placeholders are not replaced.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);