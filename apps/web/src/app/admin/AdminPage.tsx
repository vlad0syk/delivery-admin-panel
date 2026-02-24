import { useState } from "react"
import Header from "@/components/layout/Header"
import ImportSection from "@/components/dashboard/ImportSection"
import CreateOrderSection from "@/components/dashboard/CreateOrderForm"
import OrdersSection from "@/components/dashboard/OrdersTable"
import StatsSection from "@/components/dashboard/StatsSection"

export default function AdminPage()
{
  return (
    <div className="min-h-screen bg-gray-100">
        {/* Header */}
       <Header />
       <StatsSection />
        {/* Import + Create */}
        
          <ImportSection />
          <CreateOrderSection />

        {/* Orders */}
        <OrdersSection />

      </div>
  )
}
