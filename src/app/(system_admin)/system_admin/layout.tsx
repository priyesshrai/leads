import SideBar from "@/src/components/common/SideBar";

export default function SystemAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen">
            <SideBar />
            <section className="flex-1 ml-[16%] p-6">
                {children}
            </section>
        </main>
    );
}
