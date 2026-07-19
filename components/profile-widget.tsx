import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { ProfileMenu } from "./profile-menu";

export async function ProfileWidget() {
  const session = await auth();
  if (!session?.user) return null;

  const name = session.user.name?.trim() || session.user.email || "Account";
  const email = session.user.email ?? "";

  return (
    <ProfileMenu
      name={name}
      email={email}
      signOutForm={
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      }
    />
  );
}
