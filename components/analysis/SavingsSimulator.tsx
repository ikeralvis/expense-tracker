'use client';

import { CategoryAnalysis } from '@/lib/utils/analysis';
import { PiggyBank, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    readonly categories: CategoryAnalysis[];
}

export default function SavingsSimulator({ categories }: Props) {
    const [selectedCatId, setSelectedCatId] = useState<string>('all');
    const [reductionPercent, setReductionPercent] = useState<number>(10);

    // Calculate potential savings
    const simulation = useMemo(() => {
        let baseAmount = 0;

        if (selectedCatId === 'all') {
            baseAmount = categories.reduce((sum, cat) => sum + cat.predictedNextMonth, 0);
        } else {
            const cat = categories.find(c => c.categoryId === selectedCatId);
            baseAmount = cat ? cat.predictedNextMonth : 0;
        }

        const monthlySaving = baseAmount * (reductionPercent / 100);
        const yearlySaving = monthlySaving * 12;

        return { monthlySaving, yearlySaving, baseAmount };
    }, [categories, selectedCatId, reductionPercent]);

    return (
        <div className="bg-white rounded-3xl border border-neutral-200/60 shadow-card p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">

                {/* Controls Section */}
                <div className="flex-1 w-full space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-violet-50 rounded-xl text-violet-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Simulador de Ahorro</h2>
                            <p className="text-sm text-neutral-500">
                                Visualiza el impacto de reducir gastos superfluos
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="category-select" className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Categoría</label>
                            <div className="relative">
                                <select
                                    id="category-select"
                                    value={selectedCatId}
                                    onChange={(e) => setSelectedCatId(e.target.value)}
                                    className="w-full appearance-none bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
                                >
                                    <option value="all">Todas las Categorías</option>
                                    {categories.map(cat => (
                                        <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName} ({new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cat.predictedNextMonth)})</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                <span>Reducción</span>
                                <span className="text-violet-600">{reductionPercent}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="5"
                                value={reductionPercent}
                                onChange={(e) => setReductionPercent(Number(e.target.value))}
                                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-violet-600 transition-all hover:accent-violet-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Divider for mobile */}
                <div className="w-full h-px bg-neutral-100 md:hidden"></div>
                <div className="hidden md:block w-px h-24 bg-neutral-100"></div>

                {/* Results Section - Hero Card */}
                <div className="w-full md:w-auto min-w-[300px]">
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-4">Ahorro Potencial Anual</h3>

                        <div className="flex items-center justify-center gap-2 mb-2">
                            <PiggyBank className="w-6 h-6 text-emerald-400" />
                            <span className="text-4xl font-bold tracking-tight">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(simulation.yearlySaving)}
                            </span>
                        </div>

                        <div className="text-sm text-neutral-400 font-medium">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(simulation.monthlySaving)} / mes
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
