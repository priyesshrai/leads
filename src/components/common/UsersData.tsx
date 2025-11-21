"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo, useState, useEffect } from "react";
import { styled } from '@mui/material/styles';

import {
    DataGrid,
    GridColDef,
    GridToolbar,
} from "@mui/x-data-grid";

import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography
} from "@mui/material";

export interface FormAnswers {
    [key: string]: string;
}
export interface FormResponseItem {
    responseId: string;
    submittedAt: string;
    answers: FormAnswers;
}
export interface FormResponsesData {
    id: string;
    formId: string;
    title: string;
    description: string;
    responses: FormResponseItem[];
    page: number;
    limit: number;
    totalResponse: number;
    pageCount: number;
    hasMore: boolean;
    nextPage: number | null;
    prevPage: number | null;
}

export default function UsersData({ formId }: { formId: string }) {
    const STORAGE_KEY = `form_${formId}_column_visibility`;
    const hasFormId = !!formId;
    const [page] = useState(0);
    const [pageSize] = useState(20);

    const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({});
    const [openResponse, setOpenResponse] = useState<FormResponseItem | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setColumnVisibilityModel(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (Object.keys(columnVisibilityModel).length)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibilityModel));
    }, [columnVisibilityModel]);

    const { data, isLoading } = useQuery<FormResponsesData>({
        queryKey: ["form_responses", formId, page, pageSize],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/form/${formId}/response`, {
                params: { page: page + 1, limit: pageSize },
                withCredentials: true,
            });
            return res.data;
        },
        enabled: !!formId,
        retry: 1,
        placeholderData: (prev) => prev,
    });
    const responses = data?.responses || [];
    const dynamicCols = responses.length ? Object.keys(responses[0].answers) : [];

    const columns: GridColDef[] = useMemo(() => {
        const dynamicFields = dynamicCols.map((key) => ({
            field: key,
            headerName: key,
            flex: 1,
            minWidth: 180,
            sortable: true,
            filterable: true,
            // @ts-ignore
            valueGetter: (value, row) => row?.answers?.[key] ?? "",
            // @ts-ignore
            renderCell: (params) => {
                const v = params.value;
                if (typeof v === "string" && v.startsWith("http")) {
                    return <a href={v} target="_blank" rel="noreferrer">File</a>;
                }
                if (typeof v === "string" && v.startsWith("[")) {
                    return JSON.parse(v).join(", ");
                }
                return v;
            }
        }));

        return [
            {
                field: "_index", headerName: "#", width: 70, sortable: false,
                valueGetter: (value, row) => row.idx
            },
            ...dynamicFields,
            {
                field: "submittedAt",
                headerName: "Submitted",
                width: 200,
                valueGetter: (value, row) => new Date(row?.submittedAt).toLocaleString(),
            },
            {
                field: "actions",
                headerName: "Actions",
                width: 120,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                    <Button size="small" onClick={() => setOpenResponse(params.row)}>
                        View
                    </Button>
                ),
            },
        ];
    }, [dynamicCols, responses]);

    // if (isLoading) return <Spinner />;
    if (!hasFormId) return null;

    return (
        <div className="w-full">

            <div className="flex justify-between items-center mb-5">
                <h1 className="font-bold text-zinc-800 text-xl">
                    User Data of {data?.title}
                </h1>
            </div>

            <DataGrid
                showToolbar
                loading={isLoading}
                rows={responses}
                columns={columns}
                getRowId={(row) => row.responseId}
                autoHeight
                disableRowSelectionOnClick
                getRowHeight={() => "auto"}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                onRowClick={(params) => setOpenResponse(params.row)}
                slots={{
                    toolbar: GridToolbar,
                }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 300 },
                    },
                }}
                sx={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: 3,
                    "& .MuiDataGrid-cell": {
                        py: 2,
                    }
                }}
            />

            <Dialog open={!!openResponse} onClose={() => setOpenResponse(null)} maxWidth="sm" fullWidth>
                <DialogTitle>View Submission</DialogTitle>
                <DialogContent dividers>
                    {openResponse &&
                        Object.entries(openResponse.answers).map(([key, val]) => (
                            <Box key={key} mb={2}>
                                <Typography variant="subtitle2">{key}</Typography>
                                {val.startsWith("http") ? (
                                    <a href={val} target="_blank" rel="noreferrer">Download file</a>
                                ) : val.startsWith("[") ? (
                                    <Typography>{JSON.parse(val).join(", ")}</Typography>
                                ) : (
                                    <Typography>{val}</Typography>
                                )}
                            </Box>
                        ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenResponse(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
