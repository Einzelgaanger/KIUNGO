import { StatGridSkeleton, TableSkeleton } from "@/components/kiungo/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
      <StatGridSkeleton count={6} />
      <div className="mt-8">
        <TableSkeleton rows={8} />
      </div>
    </div>
  );
}
