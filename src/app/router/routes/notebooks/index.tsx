import { DashboardPage } from "@/pages/dashboard/ui/Dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notebooks/")({
  component: DashboardPage,
});
