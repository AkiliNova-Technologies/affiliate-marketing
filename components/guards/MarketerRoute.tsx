import { ProtectedRoute } from "./ProtectedRoute";

export default function MarketerRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={["MARKETER"]}>
      {children}
    </ProtectedRoute>
  );
}