"use client";

import type { FormCopy } from "@/lib/i18n-form";
import {
  commissionCustomLabel,
  commissionFreeLabel,
  commissionPlaceholder,
} from "@/lib/listing-market-presets";
import { inputClassName, labelClassName } from "@/components/listing/form-ui";
import { cn } from "@/lib/utils";
import type { CommissionPreset, TransactionType, UserRole } from "@/types/listing";

export type CommissionFieldProps = {
  copy: FormCopy;
  userRole: UserRole;
  transactionType: TransactionType;
  commissionPreset: CommissionPreset;
  commissionTerms: string;
  onCommissionPreset: (preset: CommissionPreset) => void;
  onCommissionTerms: (value: string) => void;
};

function radioCardClass(active: boolean): string {
  return cn(
    "rounded-lg border px-3 py-2.5",
    active
      ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
      : "border-zinc-200 dark:border-zinc-700",
  );
}

function AgentCommissionOptions({
  copy,
  transactionType,
  commissionPreset,
  commissionTerms,
  onCommissionPreset,
  onCommissionTerms,
}: Omit<CommissionFieldProps, "userRole">) {
  const freeLabel = commissionFreeLabel(transactionType, "agent", copy);
  const customLabel = commissionCustomLabel(transactionType, copy);
  const placeholder = commissionPlaceholder(transactionType, copy);
  const radioName = `commissionPreset-${transactionType}`;

  return (
    <div className="mt-2 flex flex-col gap-2">
      <label
        className={cn(
          "flex cursor-pointer items-center gap-2 text-sm",
          radioCardClass(commissionPreset === "commission_free"),
        )}
      >
        <input
          type="radio"
          name={radioName}
          checked={commissionPreset === "commission_free"}
          onChange={() => onCommissionPreset("commission_free")}
          className="text-indigo-600"
        />
        {freeLabel}
      </label>

      <div className={radioCardClass(commissionPreset === "buyer_commission")}>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name={radioName}
            checked={commissionPreset === "buyer_commission"}
            onChange={() => onCommissionPreset("buyer_commission")}
            className="text-indigo-600"
          />
          {customLabel}
        </label>
        {commissionPreset === "buyer_commission" ? (
          <input
            type="text"
            value={commissionTerms}
            placeholder={placeholder}
            onChange={(e) => onCommissionTerms(e.target.value)}
            className={cn(inputClassName(), "mt-2")}
          />
        ) : null}
      </div>
    </div>
  );
}

function PrivateSellerCommissionOptions({
  copy,
  transactionType,
  commissionPreset,
  commissionTerms,
  onCommissionPreset,
  onCommissionTerms,
}: Omit<CommissionFieldProps, "userRole">) {
  const showCustom = commissionPreset === "buyer_commission";
  const placeholder = commissionPlaceholder(transactionType, copy);

  return (
    <div className="mt-2 flex flex-col gap-3">
      <div
        className={cn(
          "inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-sm font-medium",
          showCustom
            ? "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
        )}
      >
        {copy.commissionPrivateSellerNote}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={showCustom}
          onChange={(e) => {
            if (e.target.checked) {
              onCommissionPreset("buyer_commission");
            } else {
              onCommissionPreset("commission_free");
            }
          }}
          className="rounded border-zinc-300 text-indigo-600"
        />
        {copy.commissionAddCustomFee}
      </label>

      {showCustom ? (
        <input
          type="text"
          value={commissionTerms}
          placeholder={placeholder}
          onChange={(e) => onCommissionTerms(e.target.value)}
          className={inputClassName()}
        />
      ) : null}
    </div>
  );
}

export function CommissionField(props: CommissionFieldProps) {
  const { copy, userRole, ...rest } = props;

  return (
    <div className="sm:col-span-2 lg:col-span-3">
      <p className={labelClassName()}>{copy.commissionLabel}</p>
      {userRole === "private_seller" ? (
        <PrivateSellerCommissionOptions copy={copy} {...rest} />
      ) : (
        <AgentCommissionOptions copy={copy} {...rest} />
      )}
    </div>
  );
}
