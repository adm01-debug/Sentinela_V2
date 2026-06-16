import { AppSidebar as Sidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";

export function SkeletonPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main id="main-content" className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
