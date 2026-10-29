"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function TagInput({ value, onChange, placeholder = "Add tag and press Enter...", label }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      const lastTag = value[value.length - 1];
      if (lastTag !== undefined) {
        removeTag(lastTag);
      }
    }
  };

  return (
    <div>
      {label && <label className="text-sm font-medium block mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[42px] focus-within:ring-2 focus-within:ring-ring">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded-full text-sm font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">Press Enter or comma to add tags</p>
    </div>
  );
}
