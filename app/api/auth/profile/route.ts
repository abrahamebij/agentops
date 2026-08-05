import { NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, fullName, avatarUrl } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Check or create auth user in auth.users or profiles table
    const dummyEmail = `${walletAddress.toLowerCase()}@agentops.io`;
    const dummyPassword = `Pass_${walletAddress.slice(0, 10)}`;

    let userId = "";

    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: dummyPassword,
    });

    if (signInData?.user?.id) {
      userId = signInData.user.id;
    } else {
      const { data: signUpData } = await supabase.auth.signUp({
        email: dummyEmail,
        password: dummyPassword,
        options: {
          data: {
            wallet_address: walletAddress,
            full_name: fullName || "Operator",
          },
        },
      });
      userId = signUpData?.user?.id || "";
    }

    // 2. Upsert profile into public.profiles
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        wallet_address: walletAddress,
        full_name: fullName || "Operator",
        avatar_url: avatarUrl || "",
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.warn("Profile store notice in server route:", profileError.message);
      }
    }

    return NextResponse.json({
      success: true,
      userId: userId || walletAddress,
      walletAddress,
      fullName: fullName || "Operator",
      avatarUrl: avatarUrl || "",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Profile setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
