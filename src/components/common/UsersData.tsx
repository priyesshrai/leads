"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useMemo, useState, useEffect, JSX } from "react";
import {
    Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from "@mui/lab";


import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridToolbar,
} from "@mui/x-data-grid";

import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    TextField
} from "@mui/material";
import { Chip } from "@mui/material";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EventIcon from "@mui/icons-material/Event";
import NoteIcon from "@mui/icons-material/Note";
import toast from "react-hot-toast";
import Spinner from "../ui/spinner";

const typeIcons: Record<string, JSX.Element> = {
    CALL: <LocalPhoneIcon fontSize="small" color="primary" />,
    EMAIL: <EmailIcon fontSize="small" color="primary" />,
    WHATSAPP: <WhatsAppIcon fontSize="small" color="success" />,
    MEETING: <EventIcon fontSize="small" color="secondary" />,
    NOTE: <NoteIcon fontSize="small" color="action" />,
};

const statusChip = (status: string) => {
    const styles: Record<string, any> = {
        PENDING: { color: "warning", label: "Pending" },
        COMPLETED: { color: "success", label: "Completed" },
        CANCELLED: { color: "error", label: "Cancelled" },
    };

    const s = styles[status] || styles.PENDING;

    return <Chip label={s.label} color={s.color} size="small" />;
};

export interface FormAnswers {
    [key: string]: string;
}
export interface FormResponseItem {
    responseId: string;
    submittedAt: string;
    answers: FormAnswers;
    followUps: FollowUpItem[];
    followUpCount: number;
    lastFollowUp: FollowUpItem | null;
    nextFollowUpDate: string | null;
    leadStatus: string;
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
export interface FollowUpItem {
    id: string;
    type: string;
    note: string | null;
    status: string;
    createdAt: string;
    nextFollowUpDate: string | null;
    addedBy?: {
        id: string;
        name: string;
        email: string;
    };
}

export default function UsersData({ formId }: { formId: string }) {
    const STORAGE_KEY = `form_${formId}_column_visibility`;
    const queryClient = useQueryClient();
    const hasFormId = !!formId;
    const [followType, setFollowType] = useState("NOTE");
    const [followNote, setFollowNote] = useState("");
    const [followNextDate, setFollowNextDate] = useState("");
    const [followStatus, setFollowStatus] = useState("PENDING");

    const [page] = useState(0);
    const [pageSize] = useState(20);

    const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({});
    const [openResponse, setOpenResponse] = useState<FormResponseItem | null>(null);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 20,
        page: 0,
    });

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
                params: {
                    page: paginationModel.page + 1,
                    limit: paginationModel.pageSize,
                },
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

            renderCell: (params: GridRenderCellParams) => {
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
                field: "followUpCount",
                headerName: "Follow Ups",
                width: 130,
                valueGetter: (value, row) => row.followUpCount,
            },

            {
                field: "leadStatus",
                headerName: "Status",
                width: 140,
                valueGetter: (value, row) => row.leadStatus,
            },

            // {
            //     field: "follow_up",
            //     headerName: "Follow UP",
            //     width: 120,
            //     sortable: false,
            //     filterable: false,
            //     renderCell: (params) => (
            //         <Button size="small" onClick={() => setOpenResponse(params.row)}>
            //             View
            //         </Button>
            //     ),
            // },
        ];
    }, [dynamicCols, responses]);

    // if (isLoading) return <Spinner />;
    if (!hasFormId) return null;

    const addFollowUpMutation = useMutation({
        mutationFn: async () => {
            if (!openResponse) return null;

            const payload = {
                responseId: openResponse.responseId,
                type: followType,
                status: followStatus,
                note: followNote,
                nextFollowUpDate: followNextDate || null,
            };

            const res = await axios.post("/api/v1/followup", payload, {
                withCredentials: true,
            });

            return res.data;
        },

        onSuccess: async (_, variables) => {
            toast.success("Follow Up added")
            await queryClient.invalidateQueries({
                queryKey: ["form_responses", formId, paginationModel.page, paginationModel.pageSize],
            });

            const updated = await axios.get(`/api/v1/form/${formId}/response`, {
                params: {
                    page: paginationModel.page + 1,
                    limit: paginationModel.pageSize,
                },
            });

            const updatedRow: FormResponseItem | undefined =
                updated.data.responses.find(
                    (r: FormResponseItem) => r.responseId === openResponse?.responseId
                );

            if (updatedRow) {
                setOpenResponse(updatedRow);
            }
            setFollowNote("");
            setFollowNextDate("");
            setFollowType("NOTE");
            setFollowStatus("PENDING");
        },

        onError: (err: any) => {
            toast.error("Can't add Follow Up")
            console.error("Follow-up creation failed:", err);
        },
    });
    const handleAddFollowUp = () => {
        if (!openResponse) return;
        addFollowUpMutation.mutate();
    };


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
                paginationMode="server"
                rowCount={data?.totalResponse || 0}
                paginationModel={paginationModel}
                onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
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

            <Dialog
                open={!!openResponse}
                onClose={() => setOpenResponse(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>View Lead</DialogTitle>

                <DialogContent dividers>
                    {openResponse && (
                        <>

                            {Object.entries(openResponse.answers).map(([key, val]) => {
                                const value = typeof val === "string" ? val : JSON.stringify(val);
                                return (
                                    <Box key={key} mb={2}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {key}
                                        </Typography>
                                        <Typography>{value}</Typography>
                                    </Box>
                                );
                            })}

                            <Box mt={4}>
                                <Typography variant="h6" gutterBottom>
                                    Follow-Up Timeline
                                </Typography>

                                {openResponse.followUps.length === 0 && (
                                    <Typography>No follow-ups yet.</Typography>
                                )}

                                <Timeline sx={{ pl: 0, mt: 2 }}>
                                    {openResponse.followUps.map((f, index) => (
                                        <TimelineItem key={f.id} sx={{ minHeight: "95px" }}>
                                            <TimelineSeparator>
                                                <TimelineDot
                                                    sx={{
                                                        backgroundColor:
                                                            f.status === "COMPLETED"
                                                                ? "#4caf50"
                                                                : f.status === "CANCELLED"
                                                                    ? "#f44336"
                                                                    : "#1976d2",
                                                    }}
                                                />
                                                {index !== openResponse.followUps.length - 1 && (
                                                    <TimelineConnector sx={{ backgroundColor: "#ccc" }} />
                                                )}
                                            </TimelineSeparator>

                                            <TimelineContent sx={{ pb: 4, ml: 1 }}>
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        backgroundColor: "white",
                                                        borderRadius: 2,
                                                        border: "1px solid #e0e0e0",
                                                        width: "100%",
                                                        boxShadow: 1,
                                                    }}
                                                >
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            {typeIcons[f.type] || typeIcons["NOTE"]}
                                                            <Typography fontWeight="bold">{f.type}</Typography>
                                                        </Box>

                                                        {statusChip(f.status)}
                                                    </Box>

                                                    <Typography mt={1}>
                                                        <b>Note:</b> {f.note || "-"}
                                                    </Typography>

                                                    <Typography>
                                                        <b>By:</b> {f.addedBy?.name}
                                                    </Typography>

                                                    <Typography>
                                                        <b>Date:</b>{" "}
                                                        {new Date(f.createdAt).toLocaleString()}
                                                    </Typography>

                                                    {f.nextFollowUpDate && (
                                                        <Typography>
                                                            <b>Next Follow-Up:</b>{" "}
                                                            {new Date(f.nextFollowUpDate).toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TimelineContent>
                                        </TimelineItem>
                                    ))}
                                </Timeline>
                            </Box>

                            <Box
                                mt={4}
                                p={3}
                                sx={{
                                    border: "1px solid #ddd",
                                    borderRadius: 2,
                                    background: "#fafafa",
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    Add New Follow-Up
                                </Typography>

                                <Box display="flex" flexDirection="column" gap={2}>
                                    <TextField
                                        label="Follow-Up Type"
                                        select
                                        value={followType}
                                        onChange={(e) => setFollowType(e.target.value)}
                                        SelectProps={{ native: true }}
                                        fullWidth
                                    >
                                        <option value="NOTE">Note</option>
                                        <option value="CALL">Call</option>
                                        <option value="EMAIL">Email</option>
                                        <option value="WHATSAPP">WhatsApp</option>
                                        <option value="MEETING">Meeting</option>
                                        <option value="STATUS_CHANGE">Status Change</option>
                                    </TextField>

                                    <TextField
                                        label="Status"
                                        select
                                        value={followStatus}
                                        onChange={(e) => setFollowStatus(e.target.value)}
                                        SelectProps={{ native: true }}
                                        fullWidth
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </TextField>

                                    <TextField
                                        label="Note"
                                        multiline
                                        rows={3}
                                        value={followNote}
                                        onChange={(e) => setFollowNote(e.target.value)}
                                        placeholder="Write note..."
                                        fullWidth
                                    />

                                    <TextField
                                        label="Next Follow-Up Date"
                                        type="date"
                                        value={followNextDate}
                                        onChange={(e) => setFollowNextDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />

                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleAddFollowUp}
                                        sx={{ mt: 1 }}
                                    >
                                        {addFollowUpMutation.isPending ? <Spinner color="white"/> : "Add Follow-Up" }
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenResponse(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
