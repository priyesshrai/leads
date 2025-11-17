import SideBar from "@/src/components/common/SideBar";
import TopBar from "@/src/components/common/TopBar";
import { ADMIN_TABS } from "@/src/constants/adminTabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen">
            <SideBar />
            <section className="flex-1 ml-[16.7%] bg-blue-50">
                <TopBar />
                {children}
            </section>
        </main>
    );
}
