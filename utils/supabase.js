import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wtgmljhmmmkpfabrgemg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Z21samhtbW1rcGZhYnJnZW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQyOTYsImV4cCI6MjA5NzY0MDI5Nn0.67Tt2qYqjT11t2YTpBkwN0FK9f2UhuLOfB8vC_0iCts";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
