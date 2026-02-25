export default function AuthHeader() {
  return (
    <div className="flex flex-col items-center text-center m-4">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
        <svg className="h-6 w-6 text-[#4d44f3]" stroke="currentColor" fill="currentColor">
          <use href="/auth.svg#icon-envelope" />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold text-gray-900">
        Welcome to Admin Delivery Panel
      </h1>
    </div>
  )
}