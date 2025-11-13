'use client';
import React, { ChangeEvent, useState } from 'react'
import Input from '../ui/Input';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { LoginSchema } from '@/src/types/auth';
import Link from 'next/link';

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState<boolean>(false);
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
    }

    return (
        <form className="relative w-full flex flex-col gap-3">
            <Input
                value={formValue.email}
                type="email"
                name="email"
                label="Email"
                placeholder="Enter Email"
                leftIcon={<Mail size={18} />}
                onChange={handleChange}
            // error={errors.email?.message}
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
            <Link href='/reset-password' className='ml-auto text-blue-400 '>
                Forget password?
            </Link>
            <button
                role='button'
                className={`w-full bg-blue-600 py-2.5 text-white mt-3 rounded cursor-pointer font-medium text-lg `}
            >
                Login
            </button>

        </form>
    )
}
