import { run } from "../src/vm";

describe("giao-js es5", () => {
  test("binay expression", () => {
    expect(
      run(`
      module.exports=3+4
    `)
    ).toBe(7);
  });
});
