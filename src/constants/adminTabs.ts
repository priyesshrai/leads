import { HomeIcon, FileCode2Icon, ShieldUserIcon, ClipboardPenIcon, LucideIcon } from "lucide-react";

type SidebarItem = {
    name: string;
    page: string;
    icon: LucideIcon;
};

export const SYSTEM_ADMIN: SidebarItem[] = [
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

export const ADMIN_TABS: SidebarItem[] = [
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
