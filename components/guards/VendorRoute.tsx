import { ProtectedRoute } from "./ProtectedRoute";

export default function VendorRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={["VENDOR"]}>
      {children}
    </ProtectedRoute>
  );
}