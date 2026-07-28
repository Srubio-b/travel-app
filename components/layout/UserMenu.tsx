import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/utils";
import { UserMenuClient } from "./UserMenuClient";

export async function UserMenu() {
  const supabase = await createClient();
  const { role, user } = await getUserRole(supabase);

  const fullName = user?.user_metadata?.full_name ?? null;

  return <UserMenuClient fullName={fullName} role={role} avatarUrl={null} />;
}
