"use client";

import { forwardRef, useState, type ComponentProps, type KeyboardEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@hexapixora/ui/input";
import { cn } from "@hexapixora/ui/cn";

/** A password field with a show/hide toggle and a Caps Lock warning. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<ComponentProps<"input">, "type">>(
  function PasswordInput({ className, onKeyUp, id, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const checkCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
      setCapsLock(event.getModifierState("CapsLock"));
      onKeyUp?.(event);
    };

    return (
      <div>
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            className={cn("h-10 pr-10", className)}
            onKeyUp={checkCapsLock}
            aria-describedby={capsLock && id ? `${id}-caps` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
        {capsLock && (
          <p id={id ? `${id}-caps` : undefined} className="mt-1.5 text-xs text-muted-foreground">
            Caps Lock is on.
          </p>
        )}
      </div>
    );
  },
);
