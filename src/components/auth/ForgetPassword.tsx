'use client'
import { ChangeEvent, FormEvent, useState } from 'react'
import Input from '../ui/Input'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import axios, { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'

export default function ForgetPassword() {
    const [email, setEmail] = useState<string>('')

    const loginMutation = useMutation({
        mutationFn: async (payload: string): Promise<string> => {
            const response = await axios.post(
                "/api/v1/auth/forget-password",
                {"email":payload}
            );
            return response.data;
        },
        onSuccess: () => {
            setEmail('');
        },
    });
    const { mutate, isPending, isError, error, isSuccess } = loginMutation;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        mutate(email);
    }

    return (
        <form className="relative w-full flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
                value={email}
                type="email"
                name="email"
                label="Email"
                placeholder="Enter Email"
                leftIcon={<Mail size={18} />}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                error={isError}
            />
            <Link href='/login' className='ml-auto text-blue-400 '>
                Login
            </Link>
            <button
                disabled={isPending}
                role='button'
                className={`w-full bg-blue-600 py-2.5 text-white mt-3 rounded font-medium text-lg ${isPending ? 'cursor-not-allowed' : 'cursor-pointer'} `}
            >
                {isPending ? "Loading..." : 'Login'}
            </button>
            {isError && (
                <p className="text-red-500 text-sm mt-1">
                    {((error as AxiosError)?.response?.data as { error?: string })?.error || (error as Error).message}
                </p>
            )}

            {isSuccess && (
                <p className="text-green-500 text-sm mt-1">Email Sent Successfully</p>
            )}
        </form>
    )
}
