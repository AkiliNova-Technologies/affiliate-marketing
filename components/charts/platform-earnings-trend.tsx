// components/charts/platform-earnings-trend.tsx
// This file is intentionally NOT server-rendered (imported via dynamic + ssr:false)
// to prevent recharts from generating mismatched clipPath IDs during hydration.
"use client"

import { IconChevronDown } from "@tabler/icons-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"

const earningsData = [
  { day: "Mon", gmv: 32000, earnings: 28000 },
  { day: "Tue", gmv: 38000, earnings: 32000 },
  { day: "Wed", gmv: 30000, earnings: 42000 },
  { day: "Thu", gmv: 48000, earnings: 38000 },
  { day: "Fri", gmv: 52000, earnings: 50000 },
  { day: "Sat", gmv: 42000, earnings: 35000 },
  { day: "Sun", gmv: 38000, earnings: 32000 },
]

export default function PlatformEarningsTrend() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Platform Earnings Trend</h3>
          <p className="text-xs text-muted-foreground">
            How the platform is performing financially
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
          Filter by date <IconChevronDown className="size-3" />
        </Button>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={earningsData}
          margin={{ left: 0, right: 10, top: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
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
          <Line
            type="monotone"
            dataKey="gmv"
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            dot={false}
            name="Gross Merchandise Value"
          />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke="#F97316"
            strokeWidth={2}
            dot={false}
            name="Platform Earnings"
          />
          <Legend
            iconType="line"
            iconSize={16}
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}