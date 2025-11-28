"use client";
import { useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "./ui/spinner";
import Link from "next/link";
import { ArrowRight, ListChecks, CalendarDays, Pencil, Trash2Icon, EyeIcon, CopyIcon } from "lucide-react";
import ViewForm from "./common/ViewForm";
import toast, { Toaster } from 'react-hot-toast';
import EditForm from "./common/EditForm";

interface FormField {
    id: string;
    formId: string;
    label: string;
    type: string;
    options: string;
    required: boolean;
    order: number;
}

interface FormItem {
    id: string;
    formsId: string;
    userId: string;
    title: string;
    description: string;
    slug: string;
    createdAt: string;
    accountId: string;
    fields: FormField[];
}

interface FormsResponse {
    response: {
        forms: FormItem[];
        page: number;
        limit: number;
        totalForm: number;
        pageCount: number;
        hasMore: boolean;
        nextPage: number | null;
        prevPage: number | null;
    };
}

async function fetchForms(page: number, limit: number = 10, accountId: string): Promise<FormsResponse> {
    const res = await axios.get(`/api/v1/form?page=${page}&limit=${limit}&account_id=${accountId}`, {
        withCredentials: true,
    });
    return res.data;
}

export default function FormsList({ accountId }: { accountId?: string }) {
    const [page, setPage] = useState(1);
    const limit = 10;
    const queryClient = useQueryClient();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copyLoading, setCopyLoading] = useState<boolean>(false)


    const { data, isLoading, isError } = useQuery({
        queryKey: ["forms", page, limit, accountId],
        queryFn: () => fetchForms(page, limit, accountId ?? ''),
        placeholderData: (prev) => prev,
        retry: 1,
    });

    const forms = data?.response?.forms ?? [];
    const pagination = data?.response;

    const deleteMutation = useMutation({
        mutationFn: async (formId: string) => {
            setDeletingId(formId);
            return await axios.delete(`/api/v1/form/${formId}`, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            toast.success('Form deleted successfully', {
                duration: 5000
            });
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        },
        onSettled: () => {
            setDeletingId(null);
        },
        onError: () => {
            toast.error('Something went wrong, can\'t delete the form.', {
                duration: 5000
            });
        }
    });

    function handleCopy(formId: string) {
        setCopyLoading(true);
        if (!formId) {
            return toast.error("Unable to copy link...! try after some time")
        }
        const link = `https://forms.wizards.co.in/${formId}/submit`
        navigator.clipboard.writeText(link)
        setCopyLoading(false);
        return toast("Copied...!")
    }

    return (
        <div className="relative w-full flex flex-col gap-8">

            {isLoading && (
                <div className="w-full flex justify-center py-20">
                    <Spinner />
                </div>
            )}

            {isError && (
                <p className="text-red-500 text-center py-5 text-lg font-medium">
                    Failed to load forms.
                </p>
            )}

            {!isLoading && forms.length === 0 && (
                <p className="text-gray-500 text-center py-20 text-xl font-medium">
                    No forms found. Create a new one.
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {forms.map((form) => (
                    <div
                        key={form.id}
                        className="relative rounded-2xl bg-white p-6 shadow-md border border-zinc-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col gap-4"
                    >
                        <div className="absolute top-5 right-5 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                            {form.formsId.split("-")[0]}-{form.formsId.split("-")[1]}
                        </div>

                        <h2
                            className="text-xl font-semibold text-zinc-800 truncate max-w-[180px]"
                            title={form.title}
                        >
                            {form.title}
                        </h2>


                        <p className="text-sm text-zinc-600 line-clamp-2">
                            {form.description || "No description"}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-zinc-700 mt-2">
                            <ListChecks className="w-4 h-4" />
                            <span>{form.fields.length} Fields</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-zinc-700">
                            <CalendarDays className="w-4 h-4" />
                            <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className=" flex gap-2">
                                <Link
                                    href={`?update=${form.id}`}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition-all duration-200"
                                    title="Edit Form"
                                >
                                    <Pencil size={14} />
                                </Link>
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-300 text-red-700 shadow hover:bg-red-400 transition-all duration-200 cursor-pointer"
                                    title="Delete form"
                                    onClick={() => deleteMutation.mutate(form.id)}
                                    disabled={deletingId === form.id}
                                >
                                    {deletingId === form.id ? (
                                        <Spinner color="white" />
                                    ) : (
                                        <Trash2Icon size={14} />
                                    )}
                                </button>

                                <Link
                                    href={`forms/view?id=${form.id}`}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white shadow hover:bg-green-700 transition-all duration-200"
                                    title="View Form"
                                >
                                    <EyeIcon size={14} />
                                </Link>

                                <button
                                    className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-black shadow hover:bg-gray-400 transition-all duration-200"
                                    title="Copy Form Link"
                                    onClick={() => handleCopy(form.id)}
                                >
                                    {
                                        copyLoading ? <Spinner /> : <CopyIcon size={14} />
                                    }

                                </button>

                            </div>

                            <Link
                                href={`?view=${form.id}`}
                                className="mt-4 inline-flex items-center gap-2 text-blue-600 font-medium text-sm hover:underline group w-max"
                            >
                                View Form
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {pagination?.totalForm && pagination.totalForm > limit && (
                <div className="flex items-center gap-4 mt-6 justify-center">

                    <button
                        disabled={!pagination.prevPage}
                        onClick={() => setPage((p) => p - 1)}
                        className={`px-4 py-2 rounded-lg bg-gray-200 text-sm font-medium transition-all ${!pagination.prevPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                    >
                        Previous
                    </button>

                    <span className="font-medium text-zinc-700">
                        Page {pagination.page} / {pagination.pageCount}
                    </span>

                    <button
                        disabled={!pagination.nextPage}
                        onClick={() => setPage((p) => p + 1)}
                        className={`px-4 py-2 rounded-lg bg-gray-200 text-sm font-medium transition-all ${!pagination.nextPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                    >
                        Next
                    </button>

                </div>
            )}
            <ViewForm />
            <EditForm />
            <Toaster />
        </div>
    );
}
