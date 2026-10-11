import { NextRequest, NextResponse } from "next/server";
import { supabaseProxy } from "./lib/supabase/proxy";


export async function proxy(req: NextRequest, res: NextResponse) {
    return await supabaseProxy(req);
}

export const config = {
    matcher:[
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}