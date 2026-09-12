import assert from "node:assert/strict";
import test from "node:test";
import { setStyleIfChanged } from "../app/observe-resize.ts";

test("setStyleIfChanged skips redundant style writes", () => {
  const values = new Map();
  const element = {
    style: {
      getPropertyValue(name) {
        return values.get(name) ?? "";
      },
      setProperty(name, value) {
        values.set(name, value);
      },
    },
  };

  setStyleIfChanged(element, "height", "1200px");
  assert.equal(element.style.getPropertyValue("height"), "1200px");

  let writes = 0;
  const originalSet = element.style.setProperty.bind(element.style);
  element.style.setProperty = (name, value) => {
    writes += 1;
    originalSet(name, value);
  };

  setStyleIfChanged(element, "height", "1200px");
  assert.equal(writes, 0);

  setStyleIfChanged(element, "height", "1400px");
  assert.equal(writes, 1);
  assert.equal(element.style.getPropertyValue("height"), "1400px");
});
