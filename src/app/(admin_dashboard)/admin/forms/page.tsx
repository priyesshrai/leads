import FormsLists from "@/src/components/FormsLists";
import Spinner from "@/src/components/ui/spinner";
import { Suspense } from "react";

export default function FormPage() {
  return (
    <section className='relative w-full p-5'>
      <h1 className='font-bold text-zinc-800 text-lg'>
        All Form List
      </h1>
      <div className='relative mt-8'>
        <Suspense fallback={<Spinner />}>
          <FormsLists />
        </Suspense>
      </div>
    </section>
  )
}
