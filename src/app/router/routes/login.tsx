import { LoginPage } from "@/pages/login/ui/LoginPage";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    //Redirect when user is auth
    if (context.auth.status === "AUTHENTICATED") {
      throw redirect({
        to: search.redirect || "/",
      });
    }
  },
  component: LoginPage,
});
