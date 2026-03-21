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
import { Button } from "@/shared/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { authScheme } from "../config/login-scheme";
import { useLoginMutation } from "../lib/useLogin";
import { useRegisterMutation } from "../lib/useRegister";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/motion-tabs";

type AuthTab = "login" | "register";

export function AuthForm() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [showPassword, setShowPassword] = useState(false);

  const {
    isLoading: loginLoading,
    login,
    error: loginError,
  } = useLoginMutation();

  const {
    register,
    isLoading: registerLoading,
    error: registerError,
  } = useRegisterMutation();

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onChange: authScheme,
    },
    onSubmit: async ({ value }) => {
      if (activeTab === "login") {
        await login(value);
        return;
      }

      await register(value);
    },
  });

  const isLoading = loginLoading || registerLoading;
  const error = activeTab === "login" ? loginError : registerError;

  const title = activeTab === "login" ? "Вход в аккаунт" : "Создание аккаунта";
  const description =
    activeTab === "login"
      ? "Войдите аккаунт, чтобы начать работу с платформой"
      : "Создайте аккаунт, чтобы начать работу с платформой";
  const submitLabel = activeTab === "login" ? "Войти" : "Зарегистрироваться";
  const passwordAutocomplete =
    activeTab === "login" ? "current-password" : "new-password";

  const handleTabChange = (value: string) => {
    const nextTab = value as AuthTab;
    setActiveTab(nextTab);
    setShowPassword(false);
  };

  return (
    <div className="flex flex-col gap-y-2 w-full  max-w-sm ">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full gap-6"
      >
        <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-muted p-1">
          <TabsTrigger value="login" className="rounded-lg font-semibold">
            Вход
          </TabsTrigger>
          <TabsTrigger value="register" className="rounded-lg font-semibold">
            Регистрация
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Card className="w-full bg-transparent max-w-sm border-none p-0 shadow-none">
        <CardHeader className="text-center pt-4">
          <CardTitle className="sm:text-2xl text-xl font-bold">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
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
                        autoComplete="username"
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
                          autoComplete={passwordAutocomplete}
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
            {activeTab === "login"
              ? error.message === "UNAUTHORIZED"
                ? "Неверный логин или пароль"
                : error.message
              : error.message}
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
            {isLoading ? <Spinner /> : submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
