export default function InventoryLoading() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        <div className="mb-7">
          <div className="h-3 w-32 animate-pulse rounded bg-neutral-200" />

          <div className="mt-3 h-10 w-56 animate-pulse rounded-xl bg-neutral-200" />

          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-neutral-200" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl bg-white"
              />
            )
          )}
        </div>

        <div className="mt-6 h-[500px] animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  )
}