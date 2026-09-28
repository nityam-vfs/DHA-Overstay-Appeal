import { HydrationGate } from "@/components/hydration-gate";

export default function OnlineLayout({ children }: { children: React.ReactNode }) {
  return <HydrationGate>{children}</HydrationGate>;
}
