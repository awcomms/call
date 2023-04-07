import type { _Tag } from '$lib/components/Tag';

const join = ' *** ';
export const string_tags = (tags: _Tag[]) => tags.map((t) => t.value).join(join);
