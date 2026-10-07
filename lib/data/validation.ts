export function normalizeMods(value: unknown): string[] {
  if (typeof value === "string") {
    const original = value;
    try {
      const parsed: unknown = JSON.parse(value);
      value = Array.isArray(parsed) ? parsed : value.split(",");
    } catch { value = original.split(","); }
  }
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string")
    .map((item) => {
      try { const decoded: unknown = JSON.parse(item); return typeof decoded === "string" ? decoded.trim() : item.trim(); }
      catch { return item.trim(); }
    }).filter(Boolean))];
}

export function phoneDigits(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "").replace(/^00/, "");
}

export function safeWebUrl(value?: string | null): string {
  try { const url = new URL(value ?? ""); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}

export function messengerUrl(value?: string | null): string {
  try {
    const url = new URL(safeWebUrl(value));
    if (!["facebook.com", "www.facebook.com", "m.facebook.com"].includes(url.hostname)) return "";
    const name = url.pathname === "/profile.php" ? url.searchParams.get("id") : url.pathname.split("/").filter(Boolean)[0];
    return name && /^[a-zA-Z0-9.]+$/.test(name) ? `https://m.me/${name}` : "";
  } catch { return ""; }
}

export function withPerformanceDefaults<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data };
  for (const [next, initial] of [["new_power", "initial_power"], ["new_torque", "initial_torque"]] as const) {
    const value = data[next];
    if (value == null || (typeof value === "string" && value.trim() === "")) {
      Object.assign(result, { [next]: data[initial] });
    }
  }
  return result;
}

export function validateProject(data: Record<string, unknown>): Record<string, string> {
  data = withPerformanceDefaults(data);
  const errors: Record<string, string> = {};
  for (const key of ["combustion", "transmition", "engine_code"]) {
    if (typeof data[key] !== "string" || !data[key].trim()) errors[key] = "Acest câmp este obligatoriu";
  }
  for (const key of ["car_models", "stage"]) {
    if (!Number.isSafeInteger(Number(data[key])) || Number(data[key]) <= 0) errors[key] = "Selectează o opțiune validă";
  }
  for (const key of ["engine_capacity", "initial_power", "new_power", "initial_torque", "new_torque"]) {
    if (!Number.isFinite(Number(data[key])) || Number(data[key]) <= 0) errors[key] = "Introdu un număr pozitiv valid";
  }
  for (const [next, initial] of [["new_power", "initial_power"], ["new_torque", "initial_torque"]]) {
    if (Number(data[next]) < Number(data[initial])) errors[next] = "Valoarea nouă trebuie să fie cel puțin egală cu cea inițială";
  }
  if (data.video_url && !safeWebUrl(String(data.video_url))) errors.video_url = "Introdu un URL http sau https valid";
  return errors;
}

export function validateUpload(file: Pick<File, "size" | "type">, kind: "image" | "dyno"): string | null {
  const allowed = ["image/jpeg", "image/png", "image/webp", ...(kind === "dyno" ? ["application/pdf"] : [])];
  if (!allowed.includes(file.type)) return kind === "image" ? "Alege o imagine JPEG, PNG sau WebP." : "Alege un fișier PDF, JPEG, PNG sau WebP.";
  if (file.size <= 0 || file.size > 20 * 1024 * 1024) return "Fișierul trebuie să aibă între 1 byte și 20 MB.";
  return null;
}
