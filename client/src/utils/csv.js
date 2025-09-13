export function toCSV(expenses = []) {
  const headers = [
    "id",
    "description",
    "amount",
    "paidBy",
    "paidTo",
    "splitWith",
    "category",
    "date",
    "settled",
    "type",
  ];
  const lines = [headers.join(",")];
  expenses.forEach((e) => {
    const row = headers.map((h) => {
      let v = e[h] !== undefined ? String(e[h]) : "";
      if (v.includes(",") || v.includes('"') || v.includes("\n"))
        v = `"${v.replace(/"/g, '""')}"`;
      return v;
    });
    lines.push(row.join(","));
  });
  return lines.join("\n");
}

export function parseCSV(text) {
  // Simple CSV parser (no complex quotes across lines). For production, use a lib.
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    // naive split respecting simple quotes
    const cells = [];
    let cur = "",
      q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        q = !q;
        continue;
      }
      if (ch === "," && !q) {
        cells.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    cells.push(cur);
    const obj = {};
    headers.forEach(
      (h, idx) =>
        (obj[h] =
          cells[idx] !== undefined ? cells[idx].replace(/""/g, '"') : "")
    );
    return obj;
  });
  return { headers, rows };
}
