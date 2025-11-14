'use client';
import { ChangeEvent, FormEvent, useState } from 'react'
import Input from '../ui/Input';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { LoginReturn, LoginSchema } from '@/src/types/auth';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { redirect } from 'next/navigation';

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [disableButton, setDisableButton] = useState<boolean>(true);
    const [formValue, setFormValue] = useState<LoginSchema>({
        email: '',
        password: ''
    })
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setFormValue((prevData) => (
            {
                ...prevData,
                [name]: value
            }
        ))
        setDisableButton(!(formValue.email !== '' && formValue.password !== ''));
    }

    const loginMutation = useMutation({
        mutationFn: async (payload: LoginSchema): Promise<LoginReturn> => {
            const response = await axios.post<LoginReturn>(
                "/api/v1/auth/login",
                payload,
                { withCredentials: true }
            );
            return response.data;
        },
        onSuccess: () => {
            setFormValue({ email: "", password: "" });
            setTimeout(()=>{
                redirect('/admin/dashboard')
            },1500)
        },
    });
    const { mutate, isPending, isError, error, isSuccess } = loginMutation;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        mutate(formValue);
    }

    return (
        <form className="relative w-full flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
                value={formValue.email}
                type="email"
                name="email"
                label="Email"
                placeholder="Enter Email"
                leftIcon={<Mail size={18} />}
                onChange={handleChange}
                error={isError}
            />

            <Input
                value={formValue.password}
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                placeholder="Enter Password"
                rightIcon={
                    showPassword ? (
                        <EyeOff size={18} onClick={() => setShowPassword(false)} />
                    ) : (
                        <Eye size={18} onClick={() => setShowPassword(true)} />
                    )
                }
                onChange={handleChange}
            />
            <Link href='/forget-password' className='ml-auto text-blue-400 '>
                Forget password?
            </Link>
            <button
                disabled={disableButton || isPending}
                role='button'
                className={`w-full bg-blue-600 py-2.5 text-white mt-3 rounded font-medium text-lg ${disableButton ? 'cursor-not-allowed' : 'cursor-pointer'} `}
            >
                {isPending ? "Loading..." : 'Login'}
            </button>
            {isError && (
                <p className="text-red-500 text-sm mt-1">
                    {((error as AxiosError)?.response?.data as { error?: string })?.error || (error as Error).message}
                </p>
            )}

            {isSuccess && (
                <p className="text-green-500 text-sm mt-1">Login successful!</p>
            )}
        </form>
    )
}
