import { google } from '$lib/util/user/create/google';
import { github } from '$lib/util/user/create/github';
import type { CallbacksOptions } from '@auth/core/types';

export type SignInArg = Parameters<CallbacksOptions['signIn']>[0];

export const providers: Record<string, (arg: SignInArg) => Promise<void>> = {
	google: google,
	github: github
};
