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

const CustomXAxisTick = ({ x, y, payload }: any) => {
  const lines = payload.value.split('\n');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={24} textAnchor="middle" fill="#6b7280" fontSize={14}>
        <tspan x={0} dy="0">{lines[0]}</tspan>
        {lines[1] && <tspan x={0} dy="20" fill="#9ca3af">{lines[1]}</tspan>}
      </text>
    </g>
  );
};

export function CashFlowChart({ data }: { data: any[] }) {
  // data expected: [{ name: "Semana 1\n(1-7)", ingresos: 1000, egresos: 500, saldo: 500 }, ...]
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<CustomXAxisTick />} tickMargin={20} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} name="Ingresos" />
          <Bar dataKey="egresos" fill="#ef4444" radius={[4, 4, 0, 0]} name="Egresos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
