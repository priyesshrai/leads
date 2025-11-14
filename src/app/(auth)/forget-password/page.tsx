import ForgetPassword from '@/src/components/auth/ForgetPassword'
import LeftSection from '@/src/components/auth/LeftSection'
import RightSection from '@/src/components/auth/RightSection'

export default function ForgetPasswordPage() {
    return (
        <main className='relative w-full grid md:grid-cols-2 grid-cols-1'>
            <LeftSection title='Reset Password' children={<ForgetPassword />} />
            <RightSection imageSrc='/images/login/forget_pass.svg' />
        </main>
    )
}
