import type { LinkProps } from "@tanstack/react-router";
import { Users } from "lucide-react";

type RouteUrl = LinkProps["to"];

export type SidebarLinks = {
  title: string;
  icon: typeof Users;
  url: RouteUrl;
};
