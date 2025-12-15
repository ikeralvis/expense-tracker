'use client';

import { CategoryAnalysis } from '@/lib/utils/analysis';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
    readonly data: CategoryAnalysis;
}

export default function SmartCategoryCard({ data }: Props) {
    const {
        categoryName,
        currentMonthSpending,
        predictedNextMonth,
        alertStatus,
        alertMessage,
        trend,
        history
    } = data;

    // Calculate progress percentage based on prediction
    const progress = predictedNextMonth > 0
        ? Math.min((currentMonthSpending / predictedNextMonth) * 100, 100)
        : (currentMonthSpending > 0 ? 100 : 0);

    // Status Colors based on Alert Severity
    const statusColors = {
        normal: {
            bg: 'bg-white',
            border: 'border-neutral-200',
            icon: 'text-green-500',
            progress: 'bg-neutral-900',
            badge: 'bg-green-50 text-green-700 border-green-200'
        },
        warning: {
            bg: 'bg-amber-50/30',
            border: 'border-amber-200',
            icon: 'text-amber-500',
            progress: 'bg-amber-500',
            badge: 'bg-amber-50 text-amber-700 border-amber-200'
        },
        critical: {
            bg: 'bg-red-50/30',
            border: 'border-red-200',
            icon: 'text-red-500',
            progress: 'bg-red-500',
            badge: 'bg-red-50 text-red-700 border-red-200'
        }
    };

    const theme = statusColors[alertStatus];

    // Format currency
    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <div className={`rounded-3xl p-6 shadow-card border ${theme.border} ${theme.bg} transition-all duration-300 hover:shadow-medium relative overflow-hidden group`}>

            {/* Header: Name & Status */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 leading-tight mb-1">{categoryName}</h3>
                    {alertStatus !== 'normal' && (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${theme.badge}`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {alertStatus === 'warning' ? 'Revisar' : 'Crítico'}
                        </div>
                    )}
                </div>

                <div className="text-right">
                    <div className="text-2xl font-black text-neutral-900 tracking-tight">
                        {formatMoney(currentMonthSpending)}
                    </div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Total Mes
                    </div>
                </div>
            </div>

            {/* Progress Bar & Forecast Context */}
            <div className="mb-6">
                <div className="flex justify-between text-sm font-medium text-neutral-500 mb-2">
                    <span>Progreso</span>
                    <span>
                        {Math.round(progress)}% de ~{formatMoney(predictedNextMonth)}
                    </span>
                </div>
                <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.progress}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                {alertMessage && (
                    <p className={`text-xs mt-2 font-medium ${theme.icon}`}>
                        {alertMessage}
                    </p>
                )}
            </div>

            {/* Footer: Trend & Sparkline */}
            <div className="flex items-end justify-between h-16 pt-2 border-t border-neutral-100/50">
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-700">
                        {trend === 'increasing' && <TrendingUp className="w-4 h-4 text-red-500" />}
                        {trend === 'decreasing' && <TrendingDown className="w-4 h-4 text-green-500" />}
                        {trend === 'stable' && <Minus className="w-4 h-4 text-neutral-400" />}
                        <span>Tendencia {trend === 'increasing' ? 'Alcista' : (trend === 'decreasing' ? 'Bajista' : 'Estable')}</span>
                    </div>
                </div>

                <div className="w-24 h-full relative opacity-50 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id={`grad-${data.categoryId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fill={`url(#grad-${data.categoryId})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
