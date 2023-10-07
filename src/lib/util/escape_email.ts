const replacements = {
	',': '\\,',
	'.': '\\.',
	'<': '\\<',
	'>': '\\>',
	'{': '\\{',
	'}': '\\}',
	'[': '\\[',
	']': '\\]',
	'"': '\\"',
	"'": "\\'",
	':': '\\:',
	';': '\\;',
	'!': '\\!',
	'@': '\\@',
	'#': '\\#',
	$: '\\$',
	'%': '\\%',
	'^': '\\^',
	'&': '\\&',
	'*': '\\*',
	'(': '\\(',
	')': '\\)',
	'-': '\\-',
	'+': '\\+',
	'=': '\\=',
	'~': '\\~'
};

export const escape_email = (input: string) => {
	let res = input;
	for (const k of Object.keys(replacements)) {
		res = res.replace(k, replacements[k]);
	}
	return res;
};
// export const escape_email = (input: string) => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
