import { NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address parameter is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .ilike("wallet_address", walletAddress.trim())
      .maybeSingle();

    if (profile) {
      return NextResponse.json({
        exists: true,
        profile: {
          userId: profile.id,
          walletAddress: profile.wallet_address,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url || "",
          role: profile.role || "Operator",
        },
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Profile check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, fullName, avatarUrl, avatarBase64 } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    let finalAvatarUrl = avatarUrl || "";

    // 1. Check existing profile first to preserve name and avatar from DB
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .ilike("wallet_address", walletAddress.trim())
      .maybeSingle();

    let userId = existingProfile?.id || "";
    let finalFullName = fullName;

    if (existingProfile) {
      // Preserve existing full_name if not explicitly provided or if "Operator" fallback was sent
      if (!fullName || fullName === "Operator") {
        finalFullName = existingProfile.full_name || "Operator";
      }
      if (!finalAvatarUrl && existingProfile.avatar_url) {
        finalAvatarUrl = existingProfile.avatar_url;
      }
    }

    if (!finalFullName) {
      finalFullName = "Operator";
    }

    // 2. Upload base64 image if provided
    if (avatarBase64 && avatarBase64.startsWith("data:image")) {
      try {
        const matches = avatarBase64.match(/^data:(image\/(\w+));base64,(.+)$/);
        if (matches) {
          const ext = matches[2] || "png";
          const buffer = Buffer.from(matches[3], "base64");
          const fileName = `${walletAddress.slice(0, 8)}-${Date.now()}.${ext}`;

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

    // 3. Create auth user if missing
    if (!userId) {
      const dummyEmail = `${walletAddress.toLowerCase()}@agentops.io`;
      const dummyPassword = `Pass_${walletAddress.slice(0, 10)}`;

      const { data: adminUser } = await supabase.auth.admin.createUser({
        email: dummyEmail,
        password: dummyPassword,
        email_confirm: true,
        user_metadata: {
          wallet_address: walletAddress,
          full_name: finalFullName,
        },
      }).catch(() => ({ data: null }));

      if (adminUser?.user?.id) {
        userId = adminUser.user.id;
      } else {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: dummyEmail,
          password: dummyPassword,
        });
        if (signInData?.user?.id) {
          userId = signInData.user.id;
        }
      }
    }

    // 4. Upsert into public.profiles
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        wallet_address: walletAddress,
        full_name: finalFullName,
        avatar_url: finalAvatarUrl || "",
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Profile store error:", profileError.message);
      }
    }

    return NextResponse.json({
      success: true,
      userId: userId || walletAddress,
      walletAddress,
      fullName: finalFullName,
      avatarUrl: finalAvatarUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Profile setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
