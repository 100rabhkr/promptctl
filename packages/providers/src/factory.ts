import { Provider } from './types';
import { GoogleProvider } from './google';

export type ProviderName = 'google' | 'openai' | 'anthropic';

export function getProvider(name: ProviderName): Provider {
    switch (name) {
        case 'google':
            return new GoogleProvider();
        case 'openai':
            throw new Error("Provider 'openai' is not yet implemented");
        case 'anthropic':
            throw new Error("Provider 'anthropic' is not yet implemented");
        default:
            throw new Error(`Unknown provider: ${name}`);
    }
}
