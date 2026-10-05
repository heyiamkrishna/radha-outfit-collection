export default function OrdersLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8f6] px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl animate-pulse">

        <div className="mb-8">
          <div className="h-3 w-28 rounded bg-neutral-200" />
          <div className="mt-3 h-10 w-40 rounded-xl bg-neutral-200" />
          <div className="mt-3 h-4 w-80 rounded bg-neutral-200" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-white"
              />
            )
          )}
        </div>

        <div className="mt-8 h-[500px] rounded-3xl bg-white" />

      </div>
    </main>
  )
}