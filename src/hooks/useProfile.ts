"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UserProfileData {
  userId: string;
  walletAddress: string;
  fullName: string;
  avatarUrl: string;
  role?: string;
}

export function useProfile(walletAddress?: string) {
  return useQuery({
    queryKey: ["profile", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const res = await fetch(`/api/auth/profile?walletAddress=${walletAddress}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      if (!data.exists) return null;
      return data.profile as UserProfileData;
    },
    enabled: Boolean(walletAddress),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      walletAddress: string;
      fullName: string;
      avatarUrl?: string;
      avatarBase64?: string;
    }) => {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update profile");
      }

      return data as {
        success: boolean;
        userId: string;
        walletAddress: string;
        fullName: string;
        avatarUrl: string;
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", data.walletAddress] });
    },
  });
}
