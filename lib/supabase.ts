import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ecoxlgxjyrtsqpbmctta.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjb3hsZ3hqeXJ0c3FwYm1jdHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTY4ODUsImV4cCI6MjA4NzgzMjg4NX0.p8wZsf4ktawj5SrH3Us2qdg7QL9IIi14G-L6SCUx7io';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
