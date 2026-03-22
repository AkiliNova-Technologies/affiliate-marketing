import MarketerRoute from "@/components/guards/MarketerRoute";

export default function MarketerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
//   return <MarketerRoute>{children}</MarketerRoute>;
  return <>{children}</>;
}