import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: "module"
			}
		},
		plugins: {
			"@typescript-eslint": tseslint
		},
		rules: {
			...tseslint.configs.recommended.rules
		}
	}
];
