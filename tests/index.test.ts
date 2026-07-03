import { main, VERSION } from "../src/index";

import { logger } from "../src/logger";

describe("card-trade-social", () => {
  test("version is defined", () => {
    expect(VERSION).toBe("0.1.0");
  });

  test("main runs without error", () => {
    const loggerSpy = jest.spyOn(logger, "info").mockImplementation();
    main();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining("card-trade-social"));
    loggerSpy.mockRestore();
  });
});
