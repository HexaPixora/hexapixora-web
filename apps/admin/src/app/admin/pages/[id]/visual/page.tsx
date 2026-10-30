"use client";

import { useParams } from "next/navigation";
import { PageEditor } from "@/components/admin/page-editor/page-editor";

// The Puck preview of a page (plans/phase-4, 4-2). Replaces the page builder in 4-3.
export default function PageVisualPage() {
  const { id } = useParams<{ id: string }>();
  return <PageEditor pageId={id} />;
}
