import ProfileView from '@/src/components/common/ProfileView'
import UpdatePassword from '@/src/components/UpdatePassword'
import React from 'react'

export default function SettingPage() {
    return (
        <section className='relative w-full p-5'>
            <ProfileView />
            <UpdatePassword/>
        </section>
    )
}
