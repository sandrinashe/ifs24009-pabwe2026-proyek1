import { describe, expect, it } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("dimulai dengan string kosong secara default", () => {
    const [value] = useInput();
    expect(value.value).toBe("");
  });

  it("memperbarui nilai dari event input dan bisa di-reset", () => {
    const [value, onChange, reset] = useInput("awal");
    expect(value.value).toBe("awal");
    onChange({ target: { value: "baru" } } as unknown as Event);
    expect(value.value).toBe("baru");
    reset();
    expect(value.value).toBe("awal");
  });
});
