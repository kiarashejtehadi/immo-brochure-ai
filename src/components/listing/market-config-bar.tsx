"use client";

import { cn } from "@/lib/utils";
import { segmentActive } from "@/lib/ui-classes";
import type { FormCopy } from "@/lib/i18n-form";
import type { TargetMarket, UserRole } from "@/types/listing";
import { labelClassName } from "@/components/listing/form-ui";

export type MarketConfigBarProps = {
  copy: FormCopy;
  targetMarket: TargetMarket;
  onTargetMarket: (market: TargetMarket) => void;
  userRole: UserRole;
  onUserRole: (role: UserRole) => void;
};

export function MarketConfigBar({
  copy,
  targetMarket,
  onTargetMarket,
  userRole,
  onUserRole,
}: MarketConfigBarProps) {
  return (
    <div className="mb-4 space-y-4 rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
      <div>
        <p className={labelClassName()}>{copy.targetMarketLabel}</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onTargetMarket("dach")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition",
              targetMarket === "dach"
                ? segmentActive
                : "border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200",
            )}
          >
            {copy.targetMarketDach}
          </button>
          <button
            type="button"
            onClick={() => onTargetMarket("global")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition",
              targetMarket === "global"
                ? segmentActive
                : "border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200",
            )}
          >
            {copy.targetMarketGlobal}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="userRole" className={labelClassName()}>
          {copy.userRoleLabel}
        </label>
        <select
          id="userRole"
          value={userRole}
          onChange={(e) => onUserRole(e.target.value as UserRole)}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          <option value="agent">{copy.userRoleAgent}</option>
          <option value="private_seller">{copy.userRolePrivateSeller}</option>
        </select>
      </div>
    </div>
  );
}
