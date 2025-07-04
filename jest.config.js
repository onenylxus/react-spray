export default {
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.(ts|tsx|js|jsx)$": "babel-jest"
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	testMatch: ["**/tests/**/*.(test|spec).(ts|tsx|js)"]
};
