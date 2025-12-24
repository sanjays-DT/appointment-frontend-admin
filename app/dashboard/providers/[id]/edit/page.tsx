'use client';

import ProviderForm from "@/components/providers/ProviderForm";
import { useParams } from "next/navigation";

export default function EditProviderPage() {
  const params = useParams();
  const id = params.id as string;

  return <ProviderForm providerId={id} />;
}
