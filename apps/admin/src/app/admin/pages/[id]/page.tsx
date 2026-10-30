"use client";

import { useParams } from "next/navigation";
import { PageEditor } from "@/components/admin/page-editor/page-editor";

export default function EditPagePage() {
  const { id } = useParams<{ id: string }>();
  return <PageEditor pageId={id} />;
}
