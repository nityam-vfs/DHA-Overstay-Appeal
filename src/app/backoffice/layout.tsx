import { HydrationGate } from "@/components/hydration-gate";

export default function BackOfficeLayout({ children }: { children: React.ReactNode }) {
  return <HydrationGate>{children}</HydrationGate>;
}
