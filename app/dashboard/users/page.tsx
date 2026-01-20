// app/dashboard/users/page.tsx
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminUsers from "@/components/users/AdminUsers";

export default async function UsersPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/"); 
  }

  return (
    <div className="p-6">
      <AdminUsers />
    </div>
  );
}
