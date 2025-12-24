"use client";

import { useSearchParams } from "next/navigation";
import ClientMemo from "@/app/(admin)/(main)/memo/[time]/ClientMemo";
import MemoDetailPage from "./[id]/MemoDetailPage";

export default function MemoPage() {
  const searchParams = useSearchParams();

  const memoId = searchParams.get("memoId");

  if (!memoId) {
    return <div>Invalid meeting</div>;
  }

  return (
    <MemoDetailPage
      memoId={memoId}
    />
  );
}
