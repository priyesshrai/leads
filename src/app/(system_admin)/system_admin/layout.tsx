import SideBar from "@/src/components/common/SideBar";
import TopBar from "@/src/components/common/TopBar";
import { AuthUser } from "@/src/types/auth";

export default async function SystemAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen">
            <SideBar />
            <section className="flex-1 ml-[16.7%] bg-blue-50 overflow-hidden">
                <TopBar />
                {children}
            </section>
        </main>
    );
}
