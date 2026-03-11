// components/section-cards.tsx
import { IconUsers, IconSpeakerphone, IconPackage, IconCurrencyDollar } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { TrendingUpIcon } from "lucide-react"

interface StatCard {
  title: string
  value: string
  icon: React.ElementType
  gradient: string
  iconBg: string
  change?: string
}

const cards: StatCard[] = [
  {
    title: "Total Active Vendors",
    value: "6,000",
    icon: IconUsers,
    gradient: "from-[#F97316] to-[#FB923C]",
    iconBg: "bg-white/20",
  },
  {
    title: "Total Active Marketers",
    value: "13,000",
    icon: IconSpeakerphone,
    gradient: "from-[#EA580C] to-[#F97316]",
    iconBg: "bg-white/20",
  },
  {
    title: "Total Active Products",
    value: "6000",
    icon: IconPackage,
    gradient: "from-[#C2410C] to-[#EA580C]",
    iconBg: "bg-white/20",
  },
  {
    title: "Platform Revenue",
    value: "$10.22M",
    icon: IconCurrencyDollar,
    gradient: "from-[#92400E] to-[#B45309]",
    iconBg: "bg-white/20",
  },
]

function StatCard({ card }: { card: StatCard }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br p-5 text-white shadow-sm",
        card.gradient
      )}
    >
      {/* Decorative wave lines */}
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60 Q50 30 100 55 T200 45"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M0 75 Q60 45 120 65 T200 60"
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
        <path
          d="M0 90 Q70 60 130 80 T200 75"
          fill="none"
          stroke="white"
          strokeWidth="0.75"
        />
      </svg>

     <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/80">{card.title}</p>
            <div className={cn("rounded-lg p-2", card.iconBg)}>
          <card.icon className="size-5 text-white" />
        </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-3xl font-bold tracking-tight">{card.value}</p>
            {card.change && (
              <p className="flex items-center gap-1 text-xs text-white/90 whitespace-nowrap ml-4">
                <TrendingUpIcon size={14} /> {card.change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SectionCardsProps {
  data?: {
    totalVendors?: string | number
    totalMarketers?: string | number
    totalProducts?: string | number
    platformRevenue?: string
  }
}

export function SectionCards({ data }: SectionCardsProps) {
  const displayCards = data
    ? [
        { ...cards[0], value: String(data.totalVendors ?? cards[0].value) },
        { ...cards[1], value: String(data.totalMarketers ?? cards[1].value) },
        { ...cards[2], value: String(data.totalProducts ?? cards[2].value) },
        { ...cards[3], value: data.platformRevenue ?? cards[3].value },
      ]
    : cards

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {displayCards.map((card) => (
        <StatCard key={card.title} card={card} />
      ))}
    </div>
  )
}