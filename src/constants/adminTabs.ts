import { HomeIcon, FileCode2Icon, ShieldUserIcon, ClipboardPenIcon } from "lucide-react";

export const ADMIN_TABS = [
    {
        name: "Dashboard",
        page: "/admin/dashboard",
        icon: HomeIcon,
    },
    {
        name: "Forms",
        page: "/admin/forms",
        icon: FileCode2Icon,
    },
    {
        name: "Create Form",
        page: "/admin/forms/create",
        icon: ClipboardPenIcon,
    },
    {
        name: "Add Admin",
        page: "/admin/create-admin",
        icon: ShieldUserIcon,
    },
] as const;
