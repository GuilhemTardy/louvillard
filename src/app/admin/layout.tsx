import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";
import { AdminNav } from "@/components/admin/admin-nav";
import { site } from "@/content/site";
import { adminConfigured, isAdmin } from "@/lib/access";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) return <AdminLoginForm configured={adminConfigured} />;
  return (
    <>
      <AdminNav name={site.name} />
      <main className="container-page flex-1 py-10">{children}</main>
    </>
  );
}
