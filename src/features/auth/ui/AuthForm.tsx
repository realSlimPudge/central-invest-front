import { useForm } from "@tanstack/react-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Button } from "@/shared/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authOptions } from "@/entities/auth/api/auth.options";
import { ACCESS_TOKEN } from "@/shared/constants/auth-token";
import { formSchema } from "../config/login-scheme";
import { queryClient } from "@/shared/lib/queryClient";
import { authKeys } from "@/entities/auth/api/auth.keys";

export function AuthForm() {
  const {
    isPending: isLoading,
    mutateAsync: loginMutation,
    error,
  } = useMutation({
    ...authOptions.login(),
    onSuccess: (data) => {
      queryClient.fetchQuery({ queryKey: authKeys.me() });
      Cookies.set(ACCESS_TOKEN, data.accessToken);
      toast.success("Вы успешно вошли в аккаунт", { position: "top-center" });
    },
    onError: () => {
      toast.error("Неверные данные", { position: "top-center" });
    },
  });
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      await loginMutation(value);
    },
  });

  return (
    <Card className="w-full bg-transparent max-w-sm border-none p-0 shadow-none">
      <CardHeader className="text-center pt-4">
        <CardTitle className="text-2xl font-bold">Вход в аккаунт</CardTitle>
        <CardDescription>
          Войдите в аккаунт для доступа к функциям
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-y-4">
            <form.Field
              name="username"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="font-bold">
                      Логин
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Введите логин"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="font-bold">
                      Пароль
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Введите пароль"
                        autoComplete="off"
                        type={showPassword ? "text" : "password"}
                      />
                      <Button
                        className="absolute translate-y-[-50%] top-[50%]  right-2 px-3 size-7 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      {error && (
        <p className="text-destructive text-start ml-4">
          {error.message === "UNAUTHORIZED" && "Неверный логин или пароль"}
        </p>
      )}
      <CardFooter>
        <Button
          variant="default"
          disabled={isLoading}
          className="w-full font-bold"
          type="submit"
          form="login-form"
        >
          {isLoading ? <Spinner /> : "Войти"}
        </Button>
      </CardFooter>
    </Card>
  );
}
