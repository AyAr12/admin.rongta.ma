import { auth } from "@/lib/auth-helpers";
import Sidebar from "@/components/sidebar";
import AdminHeader from "@/components/admin-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader userName={session?.user?.name} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
