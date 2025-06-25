import React, { Suspense } from "react";
import RegistroInternacional from "@/components/dashboard/internacional/RegistroInternacional";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegistroInternacional />
    </Suspense>
  );
}
