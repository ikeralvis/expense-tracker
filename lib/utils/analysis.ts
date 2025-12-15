import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export interface MonthlySpending {
    month: string; // YYYY-MM
    amount: number;
}

export type AlertSeverity = 'normal' | 'warning' | 'critical';

export interface CategoryAnalysis {
    categoryId: string;
    categoryName: string;
    history: MonthlySpending[];
    averageMonthly: number; // Based on active window
    predictedNextMonth: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    suggestedBudget: number;
    dataConfidence: 'high' | 'medium' | 'low';
    alertStatus: AlertSeverity;
    alertMessage?: string;
    currentMonthSpending: number; // Spend in the current incomplete month
}

export interface AnalysisResult {
    totalPredicted: number;
    categories: CategoryAnalysis[];
}

// Helper: Get YYYY-MM from date string
const getMonthKey = (dateStr: string) => dateStr.substring(0, 7);

/**
 * Enterprise-grade Financial Forecasting Engine
 * Usage of formal statistical methods for robust predictions.
 */
class FinancialForecaster {

    /**
     * Detects the start of the "Active Window" by trimming leading zeros.
     * Users might have created the account months ago but started using it recently.
     */
    private getActiveSeries(values: number[]): number[] {
        const firstNonZero = values.findIndex(v => v > 0);
        if (firstNonZero === -1) return []; // No activity ever
        return values.slice(firstNonZero);
    }

    /**
     * Basic Descriptive Statistics
     */
    private getStats(data: number[]) {
        if (data.length === 0) return { mean: 0, stdDev: 0 };
        const sum = data.reduce((a, b) => a + b, 0);
        const mean = sum / data.length;
        const variance = data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length;
        return { mean, stdDev: Math.sqrt(variance) };
    }

    /**
     * Weighted Moving Average (WMA)
     * Assigns linearly increasing weights to more recent data points.
     */
    private calculateWMA(data: number[]): number {
        if (data.length === 0) return 0;
        let weightedSum = 0;
        let weightTotal = 0;
        data.forEach((val, i) => {
            const weight = i + 1;
            weightedSum += val * weight;
            weightTotal += weight;
        });
        return weightedSum / weightTotal;
    }

    /**
     * Linear Regression (Ordinary Least Squares)
     * Returns the slope (trend) and the projected next value.
     */
    private calculateLinearTrend(data: number[]) {
        const n = data.length;
        if (n < 2) return { slope: 0, nextValue: data[0] || 0 };

        const x = Array.from({ length: n }, (_, i) => i);
        const y = data;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

        const denominator = n * sumXX - sumX * sumX;
        if (denominator === 0) return { slope: 0, nextValue: data[n - 1] };

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        const nextValue = slope * n + intercept; // P(n)
        return { slope, nextValue };
    }

    /**
     * Main Prediction Method
     */
    public predict(historyValues: number[], currentSpending: number = 0): {
        prediction: number;
        trend: 'increasing' | 'decreasing' | 'stable';
        confidence: 'high' | 'medium' | 'low';
        stats: { mean: number; stdDev: number };
    } {
        const activeData = this.getActiveSeries(historyValues);
        const n = activeData.length;

        // 1. New User Scenario (No historical data, but has current spending)
        if (n === 0 && currentSpending > 0) {
            return {
                prediction: currentSpending, // Assume next month will be at least similar to this one
                trend: 'stable',
                confidence: 'low',
                stats: { mean: currentSpending, stdDev: 0 }
            };
        }

        // 1. Not enough data -> Naive Average
        if (n < 3) {
            const mean = n > 0 ? activeData.reduce((a, b) => a + b, 0) / n : 0;
            return {
                prediction: mean,
                trend: 'stable',
                confidence: 'low',
                stats: { mean, stdDev: 0 }
            };
        }

        // 2. Remove Extreme Outliers (IQR-like but simple stdDev based for small N)
        // We only filter if we have enough points to judge (N >= 5)
        let workableData = activeData;
        const { mean: rawMean, stdDev: rawStdDev } = this.getStats(activeData);

        if (n >= 5) {
            workableData = activeData.filter(v => Math.abs(v - rawMean) <= 2.0 * rawStdDev);
        }

        // Recalculate stats on cleaned data
        const stats = this.getStats(workableData);

        // 3. Calculate Components
        const wma = this.calculateWMA(workableData);
        const regression = this.calculateLinearTrend(workableData);

        // 4. Hybrid Prediction Model
        // Blend WMA (Stability) and Regression (Direction)
        // If data is very volatile (high StdDev/Mean ratio), trust WMA more.
        // If data is stable, trust Trend more.

        const cv = stats.mean > 0 ? stats.stdDev / stats.mean : 0; // Coefficient of Variation
        const instabilityFactor = Math.min(cv, 1); // Cap at 1 (100% variance)

        // Weight for Trend: Higher if stable, Lower if unstable
        const trendWeight = 1 - (instabilityFactor * 0.5);
        // Example: CV=0.1 (Stable) -> TrendWeight=0.95. CV=1.0 (Chaos) -> TrendWeight=0.5

        let prediction = (regression.nextValue * trendWeight) + (wma * (1 - trendWeight));

        // Safety bounds
        prediction = Math.max(0, prediction);

        // Determine Trend Label
        const trendThreshold = stats.mean * 0.05; // 5% change
        let trendLabel: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (regression.slope > trendThreshold) trendLabel = 'increasing';
        else if (regression.slope < -trendThreshold) trendLabel = 'decreasing';

        // Confidence Scoring
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        if (n >= 6 && cv < 0.2) confidence = 'high';
        if (n < 4 || cv > 0.5) confidence = 'low';

        return {
            prediction,
            trend: trendLabel,
            confidence,
            stats
        };
    }

    /**
     * Anomaly Detection / Smart Alerts
     */
    public analyzeHealth(
        currentSpend: number, // If tracking mid-month, this might be partial
        prediction: number,
        stats: { mean: number; stdDev: number },
        trend: 'increasing' | 'decreasing' | 'stable'
    ): { status: AlertSeverity; message?: string } {

        // Note: Comparing 'currentSpend' (potentially partial month) vs 'prediction' (full month) 
        // is tricky. Usually we compare 'projected finish' or just use the prediction for budgeting.
        // For this alert system, we assume 'currentSpend' passed here is actually the "Projected" or simply we analyze the *FORECAST* itself vs Normal.

        // ALERT 1: Spikes. Is the prediction significantly higher than normal?
        // Threshold: Mean + 1.5 StdDev
        const spikeThreshold = stats.mean + (1.5 * stats.stdDev);
        const criticalThreshold = stats.mean + (2.5 * stats.stdDev);

        if (stats.mean > 0 && prediction > criticalThreshold) {
            return { status: 'critical', message: 'Gasto inusualmente alto detectado' };
        }

        if (stats.mean > 0 && prediction > spikeThreshold) {
            return { status: 'warning', message: 'Proyección superior a lo habitual' };
        }

        // ALERT 2: Rapid Growth. Is the trend increasing aggressively?
        if (trend === 'increasing' && prediction > stats.mean * 1.25) {
            return { status: 'warning', message: 'Tendencia de gasto en aumento rápido' };
        }

        return { status: 'normal' };
    }
}

const forecaster = new FinancialForecaster();

export function analyzeSpending(
    transactions: Transaction[],
    categories: Category[],
    monthsToAnalyze: number = 6
): AnalysisResult {

    // 1. Group transactions by Category and Month
    const categoryMap = new Map<string, Map<string, number>>();

    // Initialize map
    categories.forEach(cat => categoryMap.set(cat.id, new Map()));
    const uncategorizedId = 'uncategorized';
    categoryMap.set(uncategorizedId, new Map());

    // Time window logic
    const today = new Date();
    // Logic: We analyze [Today - N months ... Today - 1 month] for history construction?
    // OR we include current month? 
    // The previous request asked to "monitor current month". 
    // So we need: History (Previous completed months) AND Current (This month so far).

    const historyKeys: string[] = [];
    // Last 'monthsToAnalyze' FULL months (excluding current)
    for (let i = monthsToAnalyze; i >= 1; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        historyKeys.push(d.toISOString().substring(0, 7));
    }

    // Current Month Key
    const currentMonthKey = today.toISOString().substring(0, 7);

    transactions.forEach(t => {
        if (t.type !== 'expense') return;

        const monthKey = getMonthKey(t.transaction_date);
        // We track both history and current
        if (!historyKeys.includes(monthKey) && monthKey !== currentMonthKey) return;

        const catId = t.category_id || uncategorizedId;
        if (!categoryMap.has(catId)) categoryMap.set(catId, new Map());

        const monthMap = categoryMap.get(catId)!;
        const currentVal = monthMap.get(monthKey) || 0;
        monthMap.set(monthKey, currentVal + t.amount);
    });

    // 2. Perform Analysis per Category
    const analyzedCategories: CategoryAnalysis[] = [];
    let totalPredicted = 0;

    categoryMap.forEach((monthData, catId) => {
        // Skip empty uncategorized
        if (catId === uncategorizedId && monthData.size === 0) return;

        // Build History Vector (completed months)
        const historyValues = historyKeys.map(key => monthData.get(key) || 0);
        const historyObjs = historyKeys.map((key, i) => ({ month: key, amount: historyValues[i] }));

        // Get Current Month Spending
        const currentMonthSpending = monthData.get(currentMonthKey) || 0;

        // Run Professional Forecast
        const { prediction, trend, confidence, stats } = forecaster.predict(historyValues, currentMonthSpending);

        // Run Smart Health Check
        const health = forecaster.analyzeHealth(currentMonthSpending, prediction, stats, trend);

        // Budget Logic (Smart)
        // If normal, suggested is the Prediction (rounded).
        // If critical/warning, maybe suggesting the 'Mean' is safer to encourage reduction?
        // Let's suggest the Prediction as the "Expected Reality", but UI can show targets.
        // For the 'suggestedBudget' field, we'll align with the Prediction but rounded.
        let suggestedBudget = Math.ceil(prediction / 10) * 10;
        if (suggestedBudget === 0 && stats.mean > 0) suggestedBudget = 10;

        const catName = categories.find(c => c.id === catId)?.name || (catId === uncategorizedId ? 'Sin Categoría' : 'Desconocida');

        analyzedCategories.push({
            categoryId: catId,
            categoryName: catName,
            history: historyObjs,
            averageMonthly: stats.mean,
            predictedNextMonth: prediction,
            currentMonthSpending,
            trend,
            suggestedBudget,
            dataConfidence: confidence,
            alertStatus: health.status,
            alertMessage: health.message
        });

        totalPredicted += prediction;
    });

    // Sort by Prediction (Highest first) or Alert Severity?
    // Let's sort by Amount descending
    analyzedCategories.sort((a, b) => b.predictedNextMonth - a.predictedNextMonth);

    return {
        totalPredicted,
        categories: analyzedCategories
    };
}
