import { ShieldQuestion } from "lucide-react";
import { COPY } from "@/lib/constants";
import { RoleSwitcher } from "@/components/kiungo/RoleSwitcher";
import type { Session } from "@/types";

export function UnauthorisedState({ session }: { session: Session }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center">
      <div className="rounded-full bg-forest-100 p-4">
        <ShieldQuestion className="h-6 w-6 text-forest-900" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-ink-900">
        {COPY.empty.unauthorised.title}
      </h1>
      <p className="mt-2 font-sans text-sm leading-relaxed text-ink-600">
        {COPY.empty.unauthorised.description}
      </p>
      <div className="mt-6 w-full max-w-sm">
        <RoleSwitcher
          currentUserId={session.userId}
          currentName={session.name}
          currentRole={session.role}
          currentEntity={session.entityName}
          tone="light"
        />
      </div>
    </div>
  );
}
