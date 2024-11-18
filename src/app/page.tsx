import React from "react";
import DaySwitch from "@/components/page/DaySwitch";

export default function Home() {
  return (
      //flex-col items-center justify-between p-24
    <main className="flex min-h-screen">
      <DaySwitch />
    </main>
  );
}