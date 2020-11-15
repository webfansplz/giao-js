import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const config = {
  input: ["src/vm.ts"],
  output: {
    file: "dist/giao.js",
    format: "umd",
    name: "giao",
  },
  plugins: [
    typescript(),
    resolve({
      preferBuiltins: false,
    }),
    commonjs({ extensions: [".js", ".ts"] }),
  ],
};

export default config;
