import Accounts from '@/src/components/Accounts'
import React from 'react'

export default function ListAccountPage() {
  return (
    <section className='relative w-full p-5'>
      <h1 className='font-bold text-zinc-800 text-lg'>
        Accounts List
      </h1>
      <div className='relative mt-8'>
        <Accounts />
      </div>
    </section>
  )
}
