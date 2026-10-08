import { WarehouseDashboard } from "@/components/dashboard/WarehouseDashboard";
import { getWarehouseDashboard } from "@/lib/demo-data";

export const metadata = {
  title: "Warehouse · SmartStock",
};

export default function WarehousePage() {
  // TODO(spec): load through the backend (or its demo-data route) once the data layer exists.
  const data = getWarehouseDashboard();

  return (
    <main className="mx-auto w-full max-w-[1600px] p-4 lg:h-[calc(100dvh-4rem)] lg:min-h-[44rem]">
      <WarehouseDashboard data={data} />
    </main>
  );
}
