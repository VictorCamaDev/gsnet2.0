import React from "react";

export function UserAvatar({ nombres }: { nombres?: string }) {
  if (!nombres) return (
    <div className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center text-gray-500">
      <span>?</span>
    </div>
  );
  const initials = nombres.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  return (
    <div className="rounded-full bg-green-100 w-8 h-8 flex items-center justify-center text-green-700 font-bold">
      {initials}
    </div>
  );
}
