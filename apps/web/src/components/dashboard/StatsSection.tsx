import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { ClipboardList, DollarSign, TrendingUp, Clock } from "lucide-react"
import { fetchStats, ORDERS_UPDATED_EVENT } from "@/api"
import type { OrdersStats } from "@/api"

type StatItem = {
  label: string
  value: string
  Icon: LucideIcon
}

function StatCard({ label, value, Icon }: StatItem) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400">{label}</p>
        <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function formatTimeSince(iso: string | null): string {
  if (!iso) return "No orders"
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 0) return "Just now"
  const totalMinutes = Math.floor(diff / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m ago`
  return `${minutes}m ago`
}

function buildStatItems(stats: OrdersStats | null): StatItem[] {
  if (!stats) {
    return [
      { label: "Total Orders", value: "—", Icon: ClipboardList },
      { label: "Total Tax Collected", value: "—", Icon: DollarSign },
      { label: "Avg Tax Rate", value: "—", Icon: TrendingUp },
      { label: "Time Remaining", value: "—", Icon: Clock },
    ]
  }

  return [
    { label: "Total Orders", value: stats.totalOrders.toLocaleString(), Icon: ClipboardList },
    { label: "Total Tax Collected", value: `$${stats.totalTaxCollected.toFixed(2)}`, Icon: DollarSign },
    { label: "Avg Tax Rate", value: `${(stats.avgTaxRate * 100).toFixed(3)}%`, Icon: TrendingUp },
    { label: "Time Remaining", value: formatTimeSince(stats.lastOrderTime), Icon: Clock },
  ]
}

export default function StatsSection() {
  const [stats, setStats] = useState<OrdersStats | null>(null)

  useEffect(() => {
    const load = () => { fetchStats().then(setStats).catch(() => {}) }
    load()

    window.addEventListener(ORDERS_UPDATED_EVENT, load)
    return () => window.removeEventListener(ORDERS_UPDATED_EVENT, load)
  }, [])

  const items = buildStatItems(stats)

  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onScroll = () => {
      const slideWidth = el.clientWidth
      const index = Math.round(el.scrollLeft / slideWidth)
      setActive(Math.max(0, Math.min(items.length - 1, index)))
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    return () => el.removeEventListener("scroll", onScroll)
  }, [items.length])

  const scrollTo = (idx: number) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" })
  }

  return (
    <section className="max-w-300 mx-auto px-6 pt-6">
      {/* MOBILE: carousel */}
      <div className="sm:hidden">
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pr-1
                     [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* hide scrollbar (webkit) */}
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}</style>

          {items.map((item) => (
            <div key={item.label} className="min-w-full snap-start pr-4">
              <StatCard {...item} />
            </div>
          ))}
        </div>

        {/* dots */}
        <div className="mt-3 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-blue-600" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP/TABLET: grid */}
      <div className="hidden sm:grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>
    </section>
  )
}