import { ENVIRONMENT } from "@/config/environment";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers"

export const createClient = async () => {
    const cookieStore = await cookies();

    return createServerClient(
        ENVIRONMENT.SUPABASE_URL!,
        ENVIRONMENT.SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookies) {
                try {
                    cookies.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch (error) {
                    console.error("Error setting cookies:", error);
                }
            }
        },
    });
}