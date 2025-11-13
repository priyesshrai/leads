import LeftSection from "@/src/components/auth/LeftSection";
import RightSection from "@/src/components/auth/RightSection";


export default function LoginPage() {
  return (
    <main className='relative w-full grid md:grid-cols-2 grid-cols-1'>
      <LeftSection />
      <RightSection />
    </main>
  )
}
