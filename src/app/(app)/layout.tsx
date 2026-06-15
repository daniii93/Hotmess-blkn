import { AppSidebar } from "../../components/layout/app-sidebar";

export default function LoggedInAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-hm-ivory text-hm-ink lg:pl-72">
      <AppSidebar />
      {children}
    </div>
  );
}
