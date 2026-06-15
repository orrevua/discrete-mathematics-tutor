import SiteHeader from "@/components/layout/SiteHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="container">{children}</main>
    </>
  );
}
