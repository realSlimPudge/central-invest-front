import { useAuth } from "@/entities/auth/lib/use-auth";

export function DashboardPage() {
  const { user } = useAuth();
  return <div>{user?.username}</div>;
}
