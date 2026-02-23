"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#0F1C3F", "#4F46E5", "#7C3AED", "#059669", "#D97706", "#E11D48"];

interface RevenueChartProps {
    data: { name: string; taxed: number; collected: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[400px]"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-900">Évolution des Recettes</h3>
                    <p className="text-sm text-slate-500">Comparaison entre montants taxés et collectés</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorTaxed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="taxed"
                        stroke="#4F46E5"
                        fillOpacity={1}
                        fill="url(#colorTaxed)"
                        strokeWidth={2}
                        name="Montant Taxé"
                    />
                    <Area
                        type="monotone"
                        dataKey="collected"
                        stroke="#059669"
                        fillOpacity={1}
                        fill="url(#colorCollected)"
                        strokeWidth={2}
                        name="Récupéré"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

interface DistributionChartProps {
    data: { name: string; value: number }[];
}

export function DistributionChart({ data }: DistributionChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[400px]"
        >
            <h3 className="font-bold text-slate-900 mb-6">Répartition par Commune</h3>
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
