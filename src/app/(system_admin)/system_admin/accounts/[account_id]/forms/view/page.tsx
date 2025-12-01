import UsersData from "@/src/components/common/UsersData";
import { Toaster } from "react-hot-toast";

export default async function ViewFormData({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const { id } = await searchParams;

    if (!id) {
        return (
            <section className="p-6">
                <h1 className="text-xl font-semibold text-red-600">
                    No form ID provided.
                </h1>
            </section>
        );
    }

    return (
        <section className='relative p-5'>
            <UsersData formId={id} />
            <Toaster/>
        </section>
    )
}
