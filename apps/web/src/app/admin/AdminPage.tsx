import Header from "@/components/layout/Header"
import ImportSection from "@/components/dashboard/ImportSection"
import CreateOrderForm from "@/components/dashboard/CreateOrderForm"
import OrdersSection from "@/components/dashboard/OrdersTable"
import StatsSection from "@/components/dashboard/StatsSection"

export default function AdminPage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-100">
      <Header />

      <main className="flex-1">
        <StatsSection />

        <section className="mx-auto max-w-300 px-6 pt-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Import & Create Orders
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ImportSection />
              <CreateOrderForm />
            </div>
          </div>
        </section>

        <OrdersSection />
      </main>

      <footer className="h-12 w-full bg-gray-100" />
    </div>
  )
}
