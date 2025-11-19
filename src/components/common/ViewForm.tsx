'use client';
import { X } from "lucide-react";
import Spinner from "../ui/spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Field {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    options?: string | null;
}

export default function ViewForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const formId = searchParams.get("view");
    const hasFormId = !!formId;

    const { data, isLoading, isError } = useQuery({
        queryKey: ["view-form", formId],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/form/${formId}`, {
                withCredentials: true,
            });
            return res.data.form;
        },
        enabled: hasFormId,
        staleTime: 1000 * 60 * 60,
    });

    const closeModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("view");

        router.push(`/admin/forms${params.toString() ? `?${params}` : ""}`);
    };

    const renderField = (field: Field, options: string[]) => {
        const baseClass =
            "w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none text-sm bg-white";

        switch (field.type) {
            case "text":
            case "email":
            case "number":
            case "date":
                return <input type={field.type} placeholder={field.label} className={baseClass} />;

            case "file":
                return <input type="file" className={baseClass} />;

            case "textarea":
                return <textarea placeholder={field.label} rows={3} className={baseClass} />;

            case "select":
                return (
                    <select className={baseClass}>
                        <option value="">Select...</option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );

            case "radio":
                return (
                    <div className="flex flex-col gap-2">
                        {options.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-sm">
                                <input type="radio" name={field.id} />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                );

            case "checkbox":
                return (
                    <div className="flex flex-col gap-2">
                        {options.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                );

            default:
                return <p className="text-zinc-500 text-sm">Unsupported field type</p>;
        }
    };

    if (!hasFormId) return null;

    return (
        <section className="fixed inset-0 bg-black/30 z-50 flex justify-center items-start p-10 overflow-auto">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 relative">

                <button
                    className="absolute right-4 top-4 w-9 h-9 rounded-full bg-zinc-200 flex justify-center items-center hover:bg-zinc-300 transition cursor-pointer"
                    onClick={closeModal}
                    aria-label="Close View Form Modal"
                >
                    <X size={18} className="text-zinc-700" />
                </button>

                {isLoading && (
                    <div className="py-10 flex justify-center">
                        <Spinner />
                    </div>
                )}

                {isError && (
                    <p className="text-center text-red-600 py-8">
                        Failed to load form details.
                    </p>
                )}

                {!isLoading && data && (
                    <>
                        <h2 className="text-2xl font-semibold text-zinc-800 mb-1">
                            {data.title}
                        </h2>

                        <p className="text-sm text-zinc-600 mb-6">
                            {data.description || "No description provided."}
                        </p>

                        <div className="space-y-3 animate-fadeIn">
                            {data.fields.map((field: Field, index: number) => {
                                let options: string[] = [];
                                if (field.options) {
                                    try {
                                        options = JSON.parse(field.options);
                                    } catch {
                                        options = [];
                                    }
                                }
                                return (
                                    <div
                                        key={field.id}
                                        className="p-4 rounded-lg border border-zinc-200 bg-zinc-50 shadow-sm hover:shadow-md transition-all duration-200 group opacity-0 animate-slideUp"
                                        style={{ animationDelay: `${index * 0.08}s` }}
                                    >
                                        <div className="flex justify-between mb-2">
                                            <label className="font-medium text-zinc-800 group-hover:text-black transition">
                                                {field.label}
                                            </label>

                                            {field.required && (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                                    Required
                                                </span>
                                            )}
                                        </div>

                                        <div className="transform group-hover:scale-[1.01] transition-transform">
                                            {renderField(field, options)}
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </>
                )}

            </div>
        </section>
    );
}
