import { getAuthUser } from "@/src/lib/getAuthUser";
import ProfileDropdown from "./ProfileDropdown";
import { AuthUser } from "@/src/types/auth";

export default async function Profile() {
    const user : AuthUser | null  = await getAuthUser();
    
    if (!user) {
        return (
            <div className="w-10 h-10 rounded-full bg-gray-200" />
        );
    }

    return (
        <ProfileDropdown user={user} />
    );
}
