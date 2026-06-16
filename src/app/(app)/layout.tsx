import { AppSidebar } from "../../components/layout/app-sidebar";
import { BottomNav } from "../../components/navigation/BottomNav";

export default function LoggedInAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-hm-ivory pb-24 text-hm-ink lg:pl-72">
      <AppSidebar />
      {children}
      <BottomNav />
    </div>
  );
}
