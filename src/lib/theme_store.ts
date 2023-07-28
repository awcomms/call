import { typeStore } from '$lib/util/store';
import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte';

export const theme_key = '__carbon-theme';
export const theme = typeStore<CarbonTheme>(theme_key, 'g100', (v) => {
	if (v !== ('white' || 'g10' || 'g80' || 'g90' || 'g100')) return 'g100';
	return v;
});
