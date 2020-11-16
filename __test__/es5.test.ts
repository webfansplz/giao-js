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
  test("test for loop", () => {
    expect(
      run(`
      var result = 0;
      for (var i = 0; i < 5; i++) {
        result += 2;
      }
      module.exports = result;
    `)
    ).toBe(10);
  });
});
