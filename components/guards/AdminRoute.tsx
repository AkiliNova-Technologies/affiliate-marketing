import ProtectedRoute from "./ProtectedRoute";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={["ADMIN", "STAFF"]}>
      {children}
    </ProtectedRoute>
  );
}