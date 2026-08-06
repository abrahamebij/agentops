import { NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/supabase/server";

export function getDefaultAvatarUrl(walletAddress: string, name?: string): string {
  const seed = walletAddress.trim().toLowerCase();
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
}

export async function getOrCreateProfileId(
  supabase: ReturnType<typeof createServerClient>,
  walletAddress: string,
  fullName?: string,
  avatarUrl?: string
): Promise<{ userId: string; profile: { id: string; wallet_address: string; full_name: string; avatar_url: string; role: string } }> {
  const cleanAddress = walletAddress.trim();
  const defaultAvatar = getDefaultAvatarUrl(cleanAddress, fullName);

  // 1. Check existing profile in public.profiles
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("wallet_address", cleanAddress)
    .maybeSingle();

  if (existingProfile?.id) {
    let shouldUpdate = false;
    const updates: Record<string, string> = { updated_at: new Date().toISOString() };

    if (fullName) {
      updates.full_name = fullName;
      existingProfile.full_name = fullName;
      shouldUpdate = true;
    }

    const targetAvatar = avatarUrl || existingProfile.avatar_url || defaultAvatar;
    if (targetAvatar !== existingProfile.avatar_url) {
      updates.avatar_url = targetAvatar;
      existingProfile.avatar_url = targetAvatar;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await supabase.from("profiles").update(updates).eq("id", existingProfile.id);
    }

    return {
      userId: existingProfile.id,
      profile: {
        id: existingProfile.id,
        wallet_address: existingProfile.wallet_address,
        full_name: existingProfile.full_name || fullName || "Operator",
        avatar_url: existingProfile.avatar_url || targetAvatar,
        role: existingProfile.role || "Operator",
      },
    };
  }

  // 2. Profile missing -> Create/resolve auth user
  const dummyEmail = `${cleanAddress.toLowerCase()}@agentops.io`;
  const dummyPassword = `Pass_${cleanAddress.slice(0, 10)}`;
  const finalName = fullName || "Operator";
  const finalAvatar = avatarUrl || defaultAvatar;
  let userId = "";

  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: dummyEmail,
    password: dummyPassword,
    email_confirm: true,
    user_metadata: {
      wallet_address: cleanAddress,
      full_name: finalName,
    },
  });

  if (createData?.user?.id) {
    userId = createData.user.id;
  } else {
    // User may already exist in auth.users — search listUsers
    const { data: listData } = await supabase.auth.admin.listUsers();
    const foundUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === dummyEmail.toLowerCase()
    );
    if (foundUser?.id) {
      userId = foundUser.id;
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

  if (!userId) {
    throw new Error(
      `Failed to provision auth user for wallet: ${cleanAddress}. Reason: ${createError?.message || "Auth resolution failed"}`
    );
  }

  // 3. Upsert into public.profiles
  const profileRecord = {
    id: userId,
    wallet_address: cleanAddress,
    full_name: finalName,
    avatar_url: finalAvatar,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase.from("profiles").upsert(profileRecord);

  if (profileError) {
    console.error("Profile upsert error:", profileError.message);
    throw new Error(`Failed to upsert profile record into Supabase: ${profileError.message}`);
  }

  return {
    userId,
    profile: {
      id: userId,
      wallet_address: cleanAddress,
      full_name: finalName,
      avatar_url: finalAvatar,
      role: "Operator",
    },
  };
}

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
      const isOnboarded = Boolean(
        profile.full_name &&
        profile.full_name.trim() !== "" &&
        profile.full_name !== "Operator"
      );

      const avatarUrl = profile.avatar_url || getDefaultAvatarUrl(profile.wallet_address, profile.full_name);

      return NextResponse.json({
        exists: isOnboarded,
        profile: {
          userId: profile.id,
          walletAddress: profile.wallet_address,
          fullName: profile.full_name,
          avatarUrl,
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

    // 1. Upload base64 image if provided (supports PNG, JPEG, SVG, WebP, GIF)
    if (avatarBase64 && avatarBase64.startsWith("data:image")) {
      try {
        const matches = avatarBase64.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);(?:charset=[^;]+;)?base64,(.+)$/);
        if (matches) {
          const contentType = matches[1];
          let ext = "png";
          if (contentType.includes("svg")) {
            ext = "svg";
          } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
            ext = "jpg";
          } else if (contentType.includes("webp")) {
            ext = "webp";
          } else if (contentType.includes("gif")) {
            ext = "gif";
          }

          const buffer = Buffer.from(matches[2], "base64");
          const fileName = `${walletAddress.slice(0, 8)}-${Date.now()}.${ext}`;

          await supabase.storage.createBucket("avatars", { public: true }).catch(() => {});

          const { error: uploadErr } = await supabase.storage
            .from("avatars")
            .upload(fileName, buffer, {
              contentType,
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
            console.warn("Storage upload error, using data URL fallback:", uploadErr.message);
            finalAvatarUrl = avatarBase64;
          }
        } else {
          // If regex doesn't split, fallback to raw base64 data URL
          finalAvatarUrl = avatarBase64;
        }
      } catch (err) {
        console.warn("Server avatar processing notice:", err);
        finalAvatarUrl = avatarBase64;
      }
    }

    // 2. Ensure profile exists in auth.users and public.profiles
    const result = await getOrCreateProfileId(
      supabase,
      walletAddress,
      fullName,
      finalAvatarUrl
    );

    return NextResponse.json({
      success: true,
      userId: result.userId,
      walletAddress: result.profile.wallet_address,
      fullName: result.profile.full_name,
      avatarUrl: result.profile.avatar_url || getDefaultAvatarUrl(walletAddress, result.profile.full_name),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Profile setup failed";
    console.error("POST /api/auth/profile error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

