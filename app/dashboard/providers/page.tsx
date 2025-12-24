'use client';

import ProviderTable from "@/components/providers/ProvidersTable";
import { useRouter } from "next/navigation";

export default function ProvidersPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6">
      <ProviderTable />
    </div>
  );
}
