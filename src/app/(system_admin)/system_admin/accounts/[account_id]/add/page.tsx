import AddNewForm from '@/src/components/AddNewForm'
import Spinner from '@/src/components/ui/spinner'
import React, { Suspense } from 'react'

export default async function AddNewFormAdmin({ params }: { params: Promise<{ account_id: string }> }) {
    const { account_id } = await params
    return (
        <section className='relative w-full p-5'>
            <div className='w-full relative bg-white p-5 rounded-2xl shadow'>
                <h1 className='font-bold text-zinc-800 text-lg'>
                    Add New Form
                </h1>
                <div className='relative mt-8'>
                    <Suspense fallback={<Spinner />}>
                        <AddNewForm accountId={account_id} />
                    </Suspense>
                </div>
            </div>
        </section>
    )
}
