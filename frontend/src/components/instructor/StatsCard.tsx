import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue' }: StatsCardProps) => {
    const colorClasses = {
        blue: 'from-sky-500 to-blue-600',
        green: 'from-emerald-500 to-teal-600',
        purple: 'from-fuchsia-500 to-violet-600',
        orange: 'from-amber-500 to-orange-600',
    };

    return (
        <div className="group overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-5 flex items-center justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${colorClasses[color]} shadow-lg transition-transform group-hover:scale-110`}>
                    <Icon className="h-7 w-7 text-white" />
                </div>
                {trend && (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${trend.isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{title}</p>
            <h3 className="text-3xl font-black text-gray-950 dark:text-white">{value}</h3>
        </div>
    );
};
