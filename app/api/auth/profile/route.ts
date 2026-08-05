import { NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, fullName, avatarUrl, avatarBase64 } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    let finalAvatarUrl = avatarUrl || "";

    // 1. If base64 photo provided, upload to Supabase Storage 'avatars' bucket using Service Role Key
    if (avatarBase64 && avatarBase64.startsWith("data:image")) {
      try {
        const matches = avatarBase64.match(/^data:(image\/(\w+));base64,(.+)$/);
        if (matches) {
          const ext = matches[2] || "png";
          const buffer = Buffer.from(matches[3], "base64");
          const fileName = `${walletAddress.slice(0, 8)}-${Date.now()}.${ext}`;

          // Ensure bucket exists
          await supabase.storage.createBucket("avatars", { public: true }).catch(() => {});

          const { error: uploadErr } = await supabase.storage
            .from("avatars")
            .upload(fileName, buffer, {
              contentType: matches[1],
              upsert: true,
            });

          if (!uploadErr) {
            const { data: publicData } = supabase.storage
              .from("avatars")
              .getPublicUrl(fileName);
            if (publicData?.publicUrl) {
              finalAvatarUrl = publicData.publicUrl;
            }
          } else {
            console.warn("Storage upload error:", uploadErr.message);
          }
        }
      } catch (err) {
        console.warn("Server avatar processing notice:", err);
      }
    }

    // 2. Check or create auth user using Admin API (bypasses email confirmation)
    const dummyEmail = `${walletAddress.toLowerCase()}@agentops.io`;
    const dummyPassword = `Pass_${walletAddress.slice(0, 10)}`;

    let userId = "";

    // Check existing profile or auth user
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (existingProfile?.id) {
      userId = existingProfile.id;
    } else {
      // Use Admin API to create pre-confirmed user
      const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
        email: dummyEmail,
        password: dummyPassword,
        email_confirm: true,
        user_metadata: {
          wallet_address: walletAddress,
          full_name: fullName || "Operator",
        },
      });

      if (adminUser?.user?.id) {
        userId = adminUser.user.id;
      } else {
        console.warn("Admin createUser notice:", adminErr?.message);
        // Fallback: search auth user by email
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: dummyEmail,
          password: dummyPassword,
        });
        if (signInData?.user?.id) {
          userId = signInData.user.id;
        }
      }
    }

    // 3. Upsert profile into public.profiles table
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        wallet_address: walletAddress,
        full_name: fullName || "Operator",
        avatar_url: finalAvatarUrl || avatarUrl || "",
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Profile store error:", profileError.message);
      } else {
        console.log(`✅ Profile created successfully in Supabase for user: ${userId}`);
      }
    }

    return NextResponse.json({
      success: true,
      userId: userId || walletAddress,
      walletAddress,
      fullName: fullName || "Operator",
      avatarUrl: finalAvatarUrl || avatarUrl || "",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Profile setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
