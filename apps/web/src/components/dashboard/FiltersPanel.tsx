"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"

export type FilterValues = {
    dateFrom: string
    dateTo: string
    minSubtotal: string
    maxSubtotal: string
    minTaxAmount: string
    maxTaxAmount: string
    specialRate: string
}

const EMPTY_FILTERS: FilterValues = {
    dateFrom: "",
    dateTo: "",
    minSubtotal: "",
    maxSubtotal: "",
    minTaxAmount: "",
    maxTaxAmount: "",
    specialRate: "",
}

type FiltersPanelProps = {
    values: FilterValues
    onChange: (next: FilterValues) => void
}

export function isFiltersActive(v: FilterValues) {
    return Object.values(v).some((val) => val !== "")
}

export default function FiltersPanel({ values, onChange }: FiltersPanelProps) {
    const [isOpen, setIsOpen] = useState(false)
    const active = isFiltersActive(values)

    const set = (key: keyof FilterValues, val: string) =>
        onChange({ ...values, [key]: val })

    return (
        <div className="border-b border-gray-200">
            <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 sm:px-5"
            >
                <span className="flex items-center gap-2">
                    Filters
                    {active ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            ✓
                        </span>
                    ) : null}
                </span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isOpen ? (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 sm:px-5">
                    <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Date range */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={values.dateFrom}
                                onChange={(e) => set("dateFrom", e.target.value)}
                                className="mt-1 h-9 w-full rounded border border-gray-200 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500">
                                Date To
                            </label>
                            <input
                                type="date"
                                value={values.dateTo}
                                onChange={(e) => set("dateTo", e.target.value)}
                                className="mt-1 h-9 w-full rounded border border-gray-200 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Subtotal range */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500">
                                Min Subtotal ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={values.minSubtotal}
                                onChange={(e) => set("minSubtotal", e.target.value)}
                                className="mt-1 h-9 w-full rounded border border-gray-200 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500">
                                Max Subtotal ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={values.maxSubtotal}
                                onChange={(e) => set("maxSubtotal", e.target.value)}
                                className="mt-1 h-9 w-full rounded border border-gray-200 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Tax amount range */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500">
                                Min Tax Amount ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={values.minTaxAmount}
                                onChange={(e) => set("minTaxAmount", e.target.value)}
                                className="mt-1 h-9 w-full rounded border border-gray-200 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500">
                                Max Tax Amount ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={values.maxTaxAmount}
                                onChange={(e) => set("maxTaxAmount", e.target.value)}
                                className="mt-1 h-9 w-full rounded border border-gray-200 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Special rate */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500">
                                Special Rate
                            </label>
                            <div className="relative mt-1">
                                <select
                                    value={values.specialRate}
                                    onChange={(e) => set("specialRate", e.target.value)}
                                    className="h-9 w-full appearance-none rounded border border-gray-200 px-2 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">All</option>
                                    <option value="0">No special rate (0)</option>
                                    <option value="0.00375">MCTD (0.375%)</option>
                                </select>
                                <ChevronDown
                                    size={14}
                                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {active ? (
                        <button
                            type="button"
                            onClick={() => onChange(EMPTY_FILTERS)}
                            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                            <X size={14} />
                            Clear filters
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
