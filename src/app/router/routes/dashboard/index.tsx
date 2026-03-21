import { DashboardPage } from "@/pages/dashboard/ui/Dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});
