import FormsLists from "@/src/components/FormsLists";

export default function FormPage() {
  return (
    <section className='relative w-full p-5'>
      <h1 className='font-bold text-zinc-800 text-lg'>
        All Form List
      </h1>
      <div className='relative mt-8'>
        <FormsLists />
      </div>
    </section>
  )
}
