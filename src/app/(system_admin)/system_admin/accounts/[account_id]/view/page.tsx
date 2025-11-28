import FormsList from '@/src/components/FormsLists'
import Spinner from '@/src/components/ui/spinner'
import React, { Suspense } from 'react'

export default async function ViewFormPage({ params }: { params: Promise<{ account_id: string }> }) {
    const { account_id } = await params
    return (
        <section className='relative w-full p-5'>
            <h1 className='font-bold text-zinc-800 text-lg'>
                All Form of
            </h1>
            <div className='relative mt-8'>
                <Suspense fallback={<Spinner />}>
                    <FormsList accountId={account_id} />
                </Suspense>
            </div>
        </section>
    )
}
