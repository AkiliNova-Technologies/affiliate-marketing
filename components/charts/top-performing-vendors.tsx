// components/charts/top-performing-vendors.tsx
// This file is intentionally NOT server-rendered (imported via dynamic + ssr:false)
"use client"

import { IconChevronDown } from "@tabler/icons-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"

const vendorsData = [
  { name: "World of Africa", value: 12000 },
  { name: "Social Gems", value: 33000 },
  { name: "Colaw", value: 28000 },
  { name: "Gempay", value: 48000 },
  { name: "Kampala Nites", value: 30000 },
  { name: "Colaw", value: 28000 },
  { name: "Gempay", value: 48000 },
  { name: "Kampala Nites", value: 30000 },
]

export default function TopPerformingVendors() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">Top Performing Vendors</h3>
          <p className="text-xs text-muted-foreground">
            Which product types are most successful
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 border-[#F97316] bg-[#F97316] text-white hover:bg-[#F97316]/90 hover:text-white text-xs"
          >
            Top 5 vendors <IconChevronDown className="size-3" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            Filter by date <IconChevronDown className="size-3" />
          </Button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={vendorsData}
          margin={{ left: 0, right: 10, top: 5, bottom: 20 }}
          barSize={60}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={true}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={true}
            tickLine={false}
            tickFormatter={(v) => `$${v / 1000}k`}
            width={45}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [`$${(v / 1000).toFixed(0)}k`]}
          />
          <Bar dataKey="value" fill="#F97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}