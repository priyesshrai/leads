import { ReactNode } from "react";
import LoginForm from "./LoginForm";

interface Props {
    children: ReactNode
    title: string;
}

export default function LeftSection({ children, title }: Props) {
    return (
        <section className="relative w-full h-full min-h-screen bg-white lg:p-10 md:p-7 p-4 shadow-lg">
            <div className="w-full h-full relative flex flex-col items-center justify-center">
                <span className="text-xl">
                    Lead Management LOGO
                </span>
                <h1 className="lg:text-5xl md:text-4xl sm:text-3xl text-2xl font-bold tracking-tighter text-zinc-800 mt-4 ">
                    {title}
                </h1>

                <div className="mt-5 relative w-full max-w-lg">
                    {children}
                </div>
            </div>
        </section>
    );
}
