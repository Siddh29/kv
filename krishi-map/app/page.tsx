"use client";

import dynamic from "next/dynamic";

const MapWrapper = dynamic(() => import("@/src/components/Map/MapWrapper"), {
  ssr: false,
  loading: () => <div className="h-screen w-full flex items-center justify-center bg-gray-100 italic">Loading Map...</div>
});

export default function Home() {
  return (
    <main className="h-screen w-full">
      <MapWrapper />
    </main>
  );
}
