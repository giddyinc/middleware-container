
module.exports = {
    "extends": "eslint:recommended",
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        ecmaVersion: 9,
        sourceType: "module",
        experimentalObjectRestSpread: true
    },
    env: {
        es6: true,
        node: true,
        mocha: true
    },
    rules: {
        'no-unused-vars': 0,
        'no-console': 0,
        "semi": [2, "always"],
    },
};
