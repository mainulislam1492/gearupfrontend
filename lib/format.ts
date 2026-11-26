// Change the symbol if your backend charges in another currency (for example "BDT ")
export const CURRENCY = "$";

export const money = (n?: number | null) =>
  n == null ? "-" : `${CURRENCY}${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "-");