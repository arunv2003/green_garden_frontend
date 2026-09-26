"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RoomDetailRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;

  useEffect(() => {
    if (roomId) {
      router.replace(`/flats/${roomId}`);
    } else {
      router.replace("/flats");
    }
  }, [roomId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
      Redirecting to Flat Details...
    </div>
  );
}
