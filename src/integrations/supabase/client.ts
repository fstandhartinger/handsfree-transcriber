// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://ampuqefiqrfmimypkczi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcHVxZWZpcXJmbWlteXBrY3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NzA3MDYsImV4cCI6MjA0ODU0NjcwNn0.oxh8I4yr-WAtDpncVxSQvbRjW6lCjimUx0bEQ089rBo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);