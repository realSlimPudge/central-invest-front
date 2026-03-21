import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/ui/empty";

type ArtifactPlaceholderProps = {
  title: string;
  description: string;
};

export function ArtifactPlaceholder({
  title,
  description,
}: ArtifactPlaceholderProps) {
  return (
    <Empty className="rounded-3xl border border-dashed border-border bg-muted/35 px-6 py-12">
      <EmptyHeader className="max-w-xl gap-2">
        <EmptyTitle className="text-lg font-semibold text-[var(--text-h)]">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-sm leading-6 text-muted-foreground">
          {description}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
