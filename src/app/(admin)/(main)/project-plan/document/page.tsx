import DocumentClient from "@/components/project-plan/DocumentClient";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading document...</div>}>
      <DocumentClient />
    </Suspense>
  );
}
