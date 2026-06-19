import { main, VERSION } from "../src/index";
import * as api from "../src/index";

describe("card-trade-social", () => {
  test("version is defined", () => {
    expect(VERSION).toBe("0.1.0");
  });

  test("main runs without error", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    main();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("card-trade-social"));
    consoleSpy.mockRestore();
  });

  test("core modules are exported from the public entrypoint", () => {
    expect(api.createCard).toBeDefined();
    expect(api.createPortfolio).toBeDefined();
    expect(api.createProposal).toBeDefined();
    expect(api.calculateHydraPrice).toBeDefined();
    expect(api.createProCheckoutSession).toBeDefined();
  });
});
