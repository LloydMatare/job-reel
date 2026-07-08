"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrgRootPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/orgs/${params.slug}/dashboard`);
  }, [params.slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin size-8 border-[3px] border-primary border-t-transparent rounded-full" />
    </div>
  );
}
