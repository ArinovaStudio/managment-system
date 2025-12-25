"use client";

import { useSearchParams } from "next/navigation";
import MemoDetailPage from "./[id]/MemoDetailPage";

export default function MemoDetailPageClient() {
  const searchParams = useSearchParams();
  const memoId = searchParams.get("memoId");

  if (!memoId) {
    return <div>Invalid meeting</div>;
  }

  return <MemoDetailPage memoId={memoId} />;
}
