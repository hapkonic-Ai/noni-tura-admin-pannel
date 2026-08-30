"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isStaff } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isStaff()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}
