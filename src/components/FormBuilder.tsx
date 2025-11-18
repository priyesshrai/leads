"use client";
import { useState } from "react";
import FieldItem from "./FieldItem";
import { Loader2 } from "lucide-react";
import { useCreateForm } from "../hooks/useCreateForm";

export default function FormBuilder() {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState([]);

    const { mutateAsync, isPending } = useCreateForm();

    const addField = () => {
        setFields((prev) => [
            ...prev,
            { label: "", type: "text", required: false, options: [] },
        ]);
    };

    const updateField = (index, updates) => {
        setFields((prev) =>
            prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
        );
    };

    const removeField = (index) => {
        setFields((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            return alert("Title is required");
        }

        const payload = {
            title,
            description,
            fields,
        };

        await mutateAsync(payload);
        alert("Form Created Successfully!");

        // Clear state if needed
        setTitle("");
        setDescription("");
        setFields([]);
    };

    return (
        <form
            onSubmit={onSubmit}
            className="max-w-2xl mx-auto space-y-6 p-6 bg-gray-50 rounded-xl"
        >
            <h1 className="text-2xl font-bold mb-4">Create New Form</h1>

            <div>
                <label className="font-medium">Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            {/* Description */}
            <div>
                <label className="font-medium">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            {/* Fields */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold">Fields</h2>
                    <button
                        type="button"
                        onClick={addField}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        + Add Field
                    </button>
                </div>

                {fields.length === 0 && (
                    <p className="text-gray-500 text-sm">
                        No fields added yet. Click "Add Field".
                    </p>
                )}

                {fields.map((field, index) => (
                    <FieldItem
                        key={index}
                        index={index}
                        field={field}
                        updateField={updateField}
                        removeField={removeField}
                    />
                ))}
            </div>

            <button
                disabled={isPending}
                className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center"
            >
                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create Form
            </button>
        </form>
    );
}
