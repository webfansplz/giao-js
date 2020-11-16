import { run } from "../src/vm";

describe("giao-js es5", () => {
  test("binay expression", () => {
    expect(
      run(`
      module.exports=3 + 4
    `)
    ).toBe(7);
  });
  test("assign", () => {
    expect(
      run(`
      var i = 1;
      i += 5;
      module.exports = i;
    `)
    ).toBe(6);
  });
  test("test regex", () => {
    expect(
      run(`
      module.exports = /giao/.test('giao-js');
    `)
    ).toBeTruthy();
  });
});
