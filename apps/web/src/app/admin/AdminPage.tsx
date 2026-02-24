import Header from "@/components/layout/Header"
import ImportSection from "@/components/dashboard/ImportSection"
import CreateOrderForm from "@/components/dashboard/CreateOrderForm"
import OrdersSection from "@/components/dashboard/OrdersTable"
import StatsSection from "@/components/dashboard/StatsSection"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <StatsSection />

      <section className="max-w-300 mx-auto px-6 pt-6">
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
    </div>
  )
}
