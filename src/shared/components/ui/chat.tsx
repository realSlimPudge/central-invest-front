import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

const chatMessageVariants = cva("rounded-3xl border px-4 py-4", {
  variants: {
    role: {
      user: "ml-auto max-w-3xl border-border bg-card",
      assistant: "mr-auto max-w-4xl border-border bg-card/80",
    },
  },
  defaultVariants: {
    role: "assistant",
  },
});

const chatMessageAvatarVariants = cva(
  "flex size-8 items-center justify-center rounded-2xl border",
  {
    variants: {
      role: {
        user: "border-border bg-muted",
        assistant: "border-border bg-muted/60",
      },
    },
    defaultVariants: {
      role: "assistant",
    },
  },
);

function ChatLayout({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("space-y-4", className)}
      data-slot="chat-layout"
      {...props}
    />
  );
}

function ChatViewport({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-h-[62vh] overflow-y-auto rounded-3xl border border-border bg-muted/20 px-4 py-4",
        className,
      )}
      data-slot="chat-viewport"
      {...props}
    />
  );
}

function ChatMessageList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("space-y-4", className)}
      data-slot="chat-message-list"
      {...props}
    />
  );
}

function ChatMessage({
  className,
  role,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof chatMessageVariants>) {
  return (
    <div
      className={cn(chatMessageVariants({ role, className }))}
      data-role={role}
      data-slot="chat-message"
      {...props}
    />
  );
}

function ChatMessageHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-foreground",
        className,
      )}
      data-slot="chat-message-header"
      {...props}
    />
  );
}

function ChatMessageAvatar({
  className,
  role,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof chatMessageAvatarVariants>) {
  return (
    <span
      className={cn(chatMessageAvatarVariants({ role, className }))}
      data-role={role}
      data-slot="chat-message-avatar"
      {...props}
    />
  );
}

function ChatMessageAuthor({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-sm font-medium text-foreground", className)}
      data-slot="chat-message-author"
      {...props}
    />
  );
}

function ChatMessageBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-3 text-sm leading-7 text-foreground", className)}
      data-slot="chat-message-body"
      {...props}
    />
  );
}

function ChatComposer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-3xl border border-border bg-card px-4 py-4", className)}
      data-slot="chat-composer"
      {...props}
    />
  );
}

function ChatComposerTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      className={cn(
        "min-h-28 resize-none border-none bg-transparent px-0 py-0 text-sm leading-7 shadow-none focus-visible:ring-0",
        className,
      )}
      data-slot="chat-composer-textarea"
      {...props}
    />
  );
}

function ChatComposerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      data-slot="chat-composer-footer"
      {...props}
    />
  );
}

function ChatComposerHint({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-xs leading-5 text-muted-foreground", className)}
      data-slot="chat-composer-hint"
      {...props}
    />
  );
}

function ChatComposerActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex gap-3", className)}
      data-slot="chat-composer-actions"
      {...props}
    />
  );
}

function ChatSuggestions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      data-slot="chat-suggestions"
      {...props}
    />
  );
}

function ChatSuggestion({
  className,
  type = "button",
  variant = "outline",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "h-auto justify-start whitespace-normal rounded-2xl px-4 py-3 text-left",
        className,
      )}
      data-slot="chat-suggestion"
      type={type}
      variant={variant}
      {...props}
    />
  );
}

function ChatSuggestionLink({
  className,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        buttonVariants({ variant: "outline" }),
        "h-auto justify-start whitespace-normal rounded-2xl px-4 py-3 text-left",
        className,
      )}
      data-slot="chat-suggestion-link"
      {...props}
    />
  );
}

export {
  ChatComposer,
  ChatComposerActions,
  ChatComposerFooter,
  ChatComposerHint,
  ChatComposerTextarea,
  ChatLayout,
  ChatMessage,
  ChatMessageAuthor,
  ChatMessageAvatar,
  ChatMessageBody,
  ChatMessageHeader,
  ChatMessageList,
  ChatSuggestion,
  ChatSuggestionLink,
  ChatSuggestions,
  ChatViewport,
};
