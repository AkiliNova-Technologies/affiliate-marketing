// components/charts/sales-by-category.tsx
// This file is intentionally NOT server-rendered (imported via dynamic + ssr:false)
"use client"

import { PieChart, Pie, Cell } from "recharts"

const salesByCategoryData = [
  { name: "Software & Apps", value: 46, color: "#F97316" },
  { name: "E-Books & Digital Guides", value: 25, color: "#92400E" },
  { name: "Design and Creative Assets", value: 16, color: "#D4C4B0" },
  { name: "Services and Consulting", value: 8, color: "#6B5B4E" },
  { name: "Templates & Tools", value: 5, color: "#9CA3AF" },
]

export default function SalesByCategory() {
  return (
    <>
      <h3 className="font-semibold text-foreground">Sales by Category</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Which product types are most successful
      </p>
      <div className="flex justify-center">
        <PieChart width={180} height={160}>
          <Pie
            data={salesByCategoryData}
            cx={90}
            cy={75}
            innerRadius={45}
            outerRadius={75}
            dataKey="value"
            paddingAngle={2}
          >
            {salesByCategoryData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <ul className="mt-2 space-y-1.5">
        {salesByCategoryData.map((item) => (
          <li key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-2.5 shrink-0 rounded-sm"
                style={{ background: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium">{item.value}%</span>
          </li>
        ))}
      </ul>
    </>
  )
}