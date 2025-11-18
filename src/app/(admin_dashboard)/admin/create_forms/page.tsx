import AddNewForm from "@/src/components/AddNewForm";

export default function CreateForm() {
  return (
    <section className='relative w-full p-5'>
      <div className='w-full relative bg-white p-5 rounded-2xl shadow'>
        <h1 className='font-bold text-zinc-800 text-lg'>
          Add New Form
        </h1>
        <div className='relative mt-8'>
          <AddNewForm/>
        </div>
      </div>
    </section>
  )
}
