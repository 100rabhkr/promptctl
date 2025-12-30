import fs from 'fs';
import path from 'path';
import defaultPricing from './defaultPricing.json';

// Type for pricing structure: provider -> model -> { input: pricePerMillion, output: pricePerMillion }
// Using 'any' for the imported JSON to avoid strict typing issues with exact keys, but casting it.
type PricingMap = Record<string, Record<string, { input: number; output: number }>>;

let cachedPricing: PricingMap | null = null;

function loadPricing(): PricingMap {
    if (cachedPricing) return cachedPricing;

    // Start with default pricing
    let pricing: PricingMap = JSON.parse(JSON.stringify(defaultPricing));

    // Try to load from .promptctl/pricing.json in CWD
    // We check for the folder .promptctl in the current working directory
    const customPricingPath = path.resolve(process.cwd(), '.promptctl/pricing.json');

    if (fs.existsSync(customPricingPath)) {
        try {
            const customContent = fs.readFileSync(customPricingPath, 'utf-8');
            const customPricing = JSON.parse(customContent);
            // Merge custom pricing over default
            for (const provider in customPricing) {
                if (!pricing[provider]) {
                    pricing[provider] = customPricing[provider];
                } else {
                    Object.assign(pricing[provider], customPricing[provider]);
                }
            }
        } catch (e) {
            // access console quietly to not pollute stdout if strictly building, but acceptable here
            console.warn('Warning: Failed to load .promptctl/pricing.json', e);
        }
    }

    cachedPricing = pricing;
    return pricing;
}

export function computeCostUsd(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number
): number | undefined {
    const pricing = loadPricing();
    const providerKey = provider.toLowerCase();
    const providerPricing = pricing[providerKey];

    if (!providerPricing) return undefined;

    const modelKey = model.toLowerCase(); // simplified matching
    const modelPricing = providerPricing[modelKey] || providerPricing[model];

    if (!modelPricing) return undefined;

    const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

    return inputCost + outputCost;
}
