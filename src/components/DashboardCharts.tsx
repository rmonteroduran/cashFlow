"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function CashFlowChart({ data }: { data: any[] }) {
  // data expected: [{ name: "Semana 1", ingresos: 1000, egresos: 500, saldo: 500 }, ...]
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} name="Ingresos" />
          <Bar dataKey="egresos" fill="#ef4444" radius={[4, 4, 0, 0]} name="Egresos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
