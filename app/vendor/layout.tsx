import VendorRoute from "@/components/guards/VendorRoute";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
//   return <VendorRoute>{children}</VendorRoute>;
  return <>{children}</>;
}