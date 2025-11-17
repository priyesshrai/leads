import AddAccountForm from '@/src/components/auth/AddAccountForm'
import React from 'react'

export default function AccountCreatePage() {
  return (
    <section className='relative w-full p-5'>
      <div className='w-full relative bg-white p-5 rounded-2xl shadow'>
        <h1 className='font-bold text-zinc-800 text-lg'>
          Create New Account
        </h1>
        <div className='relative mt-8'>
          <AddAccountForm />
        </div>
      </div>
    </section>
  )
}
