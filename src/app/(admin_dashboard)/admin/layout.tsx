import SideBar from "@/src/components/admin/SideBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen">
            <SideBar />
            <section className="flex-1 ml-[16%] p-6">
                {children}
            </section>
        </main>
    );
}
