import { ENVIRONMENT } from "@/config/environment";
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => { createBrowserClient(ENVIRONMENT.SUPABASE_URL!, ENVIRONMENT.SUPABASE_PUBLISHABLE_KEY!) };