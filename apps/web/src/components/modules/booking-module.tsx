"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { bookingSchema, BookingProps } from "@/lib/module-schemas/booking-schema";
import BookingButton, { BookingLink } from "@/components/public/booking-button";

export default function BookingModule({ config }: { config?: BookingProps }) {
  const {
    heading,
    subheading,
    buttonText,
    backgroundColor,
    meetingFilter,
  } = bookingSchema.parse(config || {});

  const [links, setLinks] = useState<BookingLink[]>([]);

  useEffect(() => {
    apiClient
      .get("/settings")
      .then((res) => {
        const all: BookingLink[] = Array.isArray(res.data?.bookingLinks) ? res.data.bookingLinks : [];
        const filtered =
          meetingFilter && meetingFilter !== "all"
            ? all.filter((l) => l.label?.toLowerCase() === meetingFilter.toLowerCase())
            : all;
        setLinks(filtered);
      })
      .catch(() => setLinks([]));
  }, [meetingFilter]);

  const isDark = (hex: string) => {
    if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) return true;
    const c = hex.replace("#", "");
    const rgb = parseInt(c, 16);
    const luma = 0.2126 * ((rgb >> 16) & 0xff) + 0.7152 * ((rgb >> 8) & 0xff) + 0.0722 * (rgb & 0xff);
    return luma < 128;
  };
  const dark = isDark(backgroundColor);
  const textColor = dark ? "#ffffff" : "#0f172a";
  const mutedColor = dark ? "rgba(255,255,255,0.72)" : "rgba(15,23,42,0.65)";

  return (
    <section className="py-24" style={{ backgroundColor }}>
      <div className="container flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl" style={{ color: textColor }}>
          {heading}
        </h2>
        {subheading && (
          <p className="max-w-[620px] text-lg md:text-xl" style={{ color: mutedColor }}>
            {subheading}
          </p>
        )}
        <div className="mt-6">
          <BookingButton links={links} buttonText={buttonText} />
        </div>
      </div>
    </section>
  );
}
