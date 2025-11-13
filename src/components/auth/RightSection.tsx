import Image from "next/image";

export default function RightSection() {
    return (
        <section className="hidden md:flex w-full min-h-screen bg-blue-50 items-center justify-center">
            <Image
                src="/images/login/login-2.svg"
                alt="Login Illustration"
                width={500}
                height={500}
                className="w-[450px] h-auto"
                priority
            />
        </section>
    );
}
