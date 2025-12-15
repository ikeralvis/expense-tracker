import SmartCategoryCard from '@/components/analysis/SmartCategoryCard';
import { getSpendingAnalysis } from '@/lib/actions/analysis';
import { Activity } from 'lucide-react';

export default async function AnalysisPage() {
    const { data, error } = await getSpendingAnalysis();

    if (error || !data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    Error cargando análisis: {error || 'No se pudieron cargar los datos'}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="mb-10 flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-neutral-200">
                    <Activity className="w-8 h-8 text-neutral-900" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
                        Análisis Inteligente
                    </h1>
                    <p className="text-lg text-neutral-500 font-medium mt-1">
                        Predicciones basadas en tu actividad reciente
                    </p>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-neutral-900" />
                    Monitor de Gastos
                </h2>
                <p className="text-neutral-500 mb-6">
                    Comparativa en tiempo real de tu gasto actual vs. estimado
                </p>

                {/* Algorithm Explanation Disclaimer */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-start gap-4">
                    <div className="p-2 bg-blue-100/50 rounded-full text-blue-600 mt-0.5">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-blue-900">¿Cómo funciona esta predicción?</h3>
                        <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                            Analizamos tu historial reciente (hasta 6 meses). Si eres nuevo (ej. solo datos de Nov-Dic),
                            el sistema se adapta automáticamente a tu <strong>ventana activa</strong> para no diluir los datos.
                            <br />
                            <span className="opacity-75 text-xs mt-1 block">
                                Modelo Híbrido: Media Ponderada + Regresión Lineal Interactiva.
                            </span>
                        </p>
                    </div>
                </div>

                {data.categories.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-neutral-100">
                        <p className="text-neutral-500">No hay suficientes datos para realizar un análisis.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.categories.map((cat) => (
                            <SmartCategoryCard key={cat.categoryId} data={cat} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
