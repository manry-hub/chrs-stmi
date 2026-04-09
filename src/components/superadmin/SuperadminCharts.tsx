"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface SuperadminChartsProps {
  total: number;
  pending: number;
  confirmed: number;
}

export function SuperadminCharts({ total, pending, confirmed }: SuperadminChartsProps) {
  const pieData = [
    { name: "Pending", value: pending, color: "#d97706" }, // amber-600
    { name: "Dikonfirmasi", value: confirmed, color: "#059669" }, // emerald-600
  ];

  const barData = [
    { name: "Total", value: total, fill: "#2563eb" }, // blue-600
    { name: "Pending", value: pending, fill: "#d97706" },
    { name: "Dikonfirmasi", value: confirmed, fill: "#059669" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Pie Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Proporsi Status</h3>
        {total > 0 ? (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-slate-400 text-sm">
            Belum ada data
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Perbandingan Jumlah</h3>
        {total > 0 ? (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-slate-400 text-sm">
            Belum ada data
          </div>
        )}
      </div>
    </div>
  );
}
