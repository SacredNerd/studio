import { useMemo } from "react";

const MONTHS = [
  { value: "", label: "Month" },
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const YEAR_MIN = 1950;
const YEAR_MAX = new Date().getFullYear() + 5;

function years() {
  const arr: Array<{ value: string; label: string }> = [{ value: "", label: "Year" }];
  for (let y = YEAR_MAX; y >= YEAR_MIN; y--) arr.push({ value: String(y), label: String(y) });
  return arr;
}

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  isEndDate?: boolean;
};

export function DateField({ label, value, onChange, isEndDate = false }: Props) {
  const { month: parsedMonth, year: parsedYear, present } = useMemo(() => {
    if (!value) return { month: "", year: "", present: false };
    if (value === "Present") return { month: "", year: "", present: true };
    if (/^\d{4}-\d{2}$/.test(value)) return { month: value.slice(5), year: value.slice(0, 4), present: false };
    if (/^\d{4}$/.test(value)) return { month: "", year: value, present: false };
    return { month: "", year: "", present: false };
  }, [value]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value;
    if (present && month) return;
    if (month && parsedYear) onChange(`${parsedYear}-${month}`);
    else if (month) onChange(`${parsedYear}.${month}`);
    else if (parsedYear) onChange(parsedYear);
    else onChange("");
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    if (present && year) return;
    if (parsedMonth && year) onChange(`${year}-${parsedMonth}`);
    else if (year) onChange(year);
    else onChange("");
  };

  const handlePresentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onChange("Present");
    } else if (parsedYear || parsedMonth) {
      onChange(parsedYear ? (parsedMonth ? `${parsedYear}-${parsedMonth}` : parsedYear) : "");
    } else {
      onChange("");
    }
  };

  return (
    <label className="field" style={{ display: "grid", gap: 6 }}>
      <span>{label}</span>
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", flexWrap: "wrap" }}>
        <select
          value={parsedMonth}
          onChange={handleMonthChange}
          disabled={present}
          className="nb-input"
          style={{ width: "auto", flex: "1 1 120px", minWidth: 100 }}
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={parsedYear}
          onChange={handleYearChange}
          disabled={present}
          className="nb-input"
          style={{ width: "auto", flex: "1 1 100px", minWidth: 90 }}
        >
          {years().map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
        {isEndDate && (
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, whiteSpace: "nowrap" }}>
            <input
              type="checkbox"
              checked={present}
              onChange={handlePresentToggle}
              style={{ width: 14, height: 14 }}
            />
            Present
          </label>
        )}
      </div>
    </label>
  );
}