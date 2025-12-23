

"use client";

import { useSearchParams } from "next/navigation";
import ClientMemo from "@/app/(admin)/(main)/memo/[time]/ClientMemo";

export default function MemoPage() {
  const searchParams = useSearchParams();

  const meetingId = searchParams.get("meetingId");
  const secondsParam = searchParams.get("seconds");

  const elapsedSeconds = Number(secondsParam) || 0;

  if (!meetingId) {
    return <div>Invalid meeting</div>;
  }

  return (
    <ClientMemo
      meetingId={meetingId}
      time={elapsedSeconds}
    />
  );
}
