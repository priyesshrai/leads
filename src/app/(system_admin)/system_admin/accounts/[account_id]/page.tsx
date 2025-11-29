import ProfileView from '@/src/components/common/ProfileView'
import React from 'react'

export default async function AccountProfile({ params }: { params: Promise<{ account_id: string }> }) {
    const { account_id } = await params
    return (
        <section className='relative w-full p-5'>
            <div className='w-full relative'>
                <h1 className='font-bold text-zinc-800 text-lg'>
                    User Details
                </h1>
                <div className='relative mt-8 '>
                    <ProfileView accountId={account_id} />
                </div>
            </div>
        </section>
    )
}
