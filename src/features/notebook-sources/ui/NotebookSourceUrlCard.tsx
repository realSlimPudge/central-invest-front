import { Globe2, Link2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";

type NotebookSourceUrlCardProps = {
  value: string;
  disabled: boolean;
  isPending: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
};

export function NotebookSourceUrlCard({
  value,
  disabled,
  isPending,
  onValueChange,
  onSubmit,
}: NotebookSourceUrlCardProps) {
  return (
    <Card className="ring-1 ring-border/80">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Источник по ссылке
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-muted-foreground">
          Добавь веб-страницу, PDF по прямой ссылке или видео по ссылке. Система
          извлечет содержимое и добавит его в блокнот как обычный источник.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="source-url">Ссылка</FieldLabel>
              <div className="relative">
                <Globe2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="source-url"
                  autoComplete="off"
                  className="pl-9"
                  disabled={disabled}
                  onChange={(event) => onValueChange(event.target.value)}
                  placeholder="https://example.com/article"
                  type="url"
                  value={value}
                />
              </div>
            </Field>
          </FieldGroup>

          <Button
            disabled={disabled || !value.trim()}
            type="submit"
            variant="outline"
          >
            {isPending ? (
              <Spinner />
            ) : (
              <Link2 data-icon="inline-start" />
            )}
            Добавить по ссылке
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
