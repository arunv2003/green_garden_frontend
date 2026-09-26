"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoomsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/flats");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
      Redirecting to Flats Directory...
    </div>
  );
}
