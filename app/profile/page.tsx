import { Metadata } from "next";
import { ProfileComponent } from "@/src/components/stitch/Profile/ProfileComponent";

export const metadata: Metadata = {
  title: "Profile | AgentOps Console",
  description: "Operator profile details, avatar settings, identity governance, and session management.",
};

export default function ProfilePage() {
  return <ProfileComponent />;
}
