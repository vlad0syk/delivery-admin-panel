import { useState } from "react"
import Header from "@/components/layout/Header"
import ImportSection from "@/components/dashboard/ImportSection"
import CreateOrderSection from "@/components/dashboard/CreateOrderForm"
import OrdersSection from "@/components/dashboard/OrdersTable"

type View = "dashboard" | "orders"

export default function AdminPage() {
  const [view, setView] = useState<View>("dashboard")

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-300 mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setView("dashboard")}
            className={`px-4 py-2 rounded-xl ${view === "dashboard"
              ? "bg-black text-white"
              : "bg-white text-black"
              }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setView("orders")}
            className={`px-4 py-2 rounded-xl ${view === "orders"
              ? "bg-black text-white"
              : "bg-white text-black"
              }`}
          >
            Orders
          </button>
        </div>

        {view === "dashboard" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-6">
              <ImportSection />
              <CreateOrderSection />
            </div>
            <OrdersSection />
          </div>
        )}
      </div>
    </div>
  )
}
