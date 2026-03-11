import { ProtectedRoute } from "./ProtectedRoute";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "STAFF"]}>
      {children}
    </ProtectedRoute>
  );
}