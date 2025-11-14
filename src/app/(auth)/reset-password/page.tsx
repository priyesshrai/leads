import LeftSection from '@/src/components/auth/LeftSection'
import ResetPassword from '@/src/components/auth/ResetPassword'
import RightSection from '@/src/components/auth/RightSection'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token: string }> }) {
  const { token } = await searchParams;
  return (
    <main className='relative w-full grid md:grid-cols-2 grid-cols-1'>
      <LeftSection title='New Password' children={<ResetPassword token={token} />} />
      <RightSection imageSrc='/images/login/reset_pass.svg' />
    </main>
  )
}
