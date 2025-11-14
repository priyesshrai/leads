import LeftSection from "@/src/components/auth/LeftSection";
import LoginForm from "@/src/components/auth/LoginForm";
import RightSection from "@/src/components/auth/RightSection";


export default function LoginPage() {
  return (
    <main className='relative w-full grid md:grid-cols-2 grid-cols-1'>
      <LeftSection children={<LoginForm />} title="Welcome Back" />
      <RightSection imageSrc="/images/login/login-2.svg" />
    </main>
  )
}
