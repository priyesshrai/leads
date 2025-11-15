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
        name: "Add Account",
        page: "/admin/create-account",
        icon: ShieldUserIcon,
    },
] as const;
