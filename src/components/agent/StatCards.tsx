"use client";

import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { DollarSign, Eye, Users, AlertTriangle, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    description?: string;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    prefix?: string;
    suffix?: string;
    colorClassName?: string;
    delay?: number;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    prefix = "",
    suffix = "",
    colorClassName = "text-indigo-600 bg-indigo-50",
    delay = 0,
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", colorClassName)}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        trend.isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                    )}>
                        <TrendingUp className={cn("w-3 h-3", !trend.isPositive && "rotate-180")} />
                        {trend.value}%
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className="text-2xl font-bold text-slate-900">
                    {prefix}
                    <CountUp
                        end={value}
                        duration={2}
                        separator=" "
                        decimals={value % 1 !== 0 ? 2 : 0}
                    />
                    {suffix}
                </div>
                {description && (
                    <p className="text-xs text-slate-400 mt-1">{description}</p>
                )}
            </div>
        </motion.div>
    );
}

interface StatCardsGridProps {
    stats: {
        totalTaxed: number;
        totalCollected: number;
        activeAssujettis: number;
        totalOverdue: number;
        collectionRate: number;
    };
}

export function StatCardsGrid({ stats }: StatCardsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Taxé"
                value={stats.totalTaxed}
                icon={DollarSign}
                prefix="$"
                description="Montant total des notes émises"
                colorClassName="text-navy-600 bg-slate-100"
                delay={0.1}
            />
            <StatCard
                title="Recettes Collectées"
                value={stats.totalCollected}
                icon={Wallet}
                prefix="$"
                description={`${stats.collectionRate.toFixed(1)}% du total taxé`}
                colorClassName="text-emerald-600 bg-emerald-50"
                delay={0.2}
                trend={{ value: 12, label: "vs mois dernier", isPositive: true }}
            />
            <StatCard
                title="Assujettis Actifs"
                value={stats.activeAssujettis}
                icon={Users}
                description="Dossiers en cours de traitement"
                colorClassName="text-indigo-600 bg-indigo-50"
                delay={0.3}
            />
            <StatCard
                title="Arriérés (Overdue)"
                value={stats.totalOverdue}
                icon={AlertTriangle}
                prefix="$"
                description="Notes non payées après délai"
                colorClassName="text-rose-600 bg-rose-50"
                delay={0.4}
            />
        </div>
    );
}
