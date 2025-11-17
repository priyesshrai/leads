import { Bell } from 'lucide-react'
import Breadcrumb from './Breadcrumb'
import Profile from './Profile'
import { AuthUser } from '@/src/types/auth'

export default function TopBar() {
    return (
        <header className='relative w-full px-5 py-3 bg-white shadow-sm flex items-center justify-between'>
            <div className='relative '>
                <Breadcrumb />
            </div>
            <div className='relative flex items-center gap-5 '>
                <Bell />
                <Profile />
            </div>
        </header>
    )
}
