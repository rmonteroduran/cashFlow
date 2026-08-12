"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function MonthYearFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const selectedMonth = searchParams.get("month") || currentMonth.toString();
  const selectedYear = searchParams.get("year") || currentYear.toString();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex gap-3 items-center">
      <select 
        value={selectedMonth}
        onChange={(e) => router.push(pathname + "?" + createQueryString("month", e.target.value))}
        className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {months.map((m, i) => (
          <option key={i} value={i + 1}>{m}</option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => router.push(pathname + "?" + createQueryString("year", e.target.value))}
        className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {[...Array(5)].map((_, i) => {
          const year = currentYear - 2 + i;
          return <option key={year} value={year}>{year}</option>;
        })}
      </select>
    </div>
  );
}
