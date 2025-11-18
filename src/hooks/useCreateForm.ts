import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useCreateForm() {
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await axios.post("/api/v1/form", data, { withCredentials: true });
            return res.data;
        },
    });
}
