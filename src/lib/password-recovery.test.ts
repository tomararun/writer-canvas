import { describe, expect, it } from "vitest";

import { recoveryRedirectTarget } from "./password-recovery";

const RECOVERY_HASH = "#access_token=abc&expires_in=3600&refresh_token=def&type=recovery";

describe("recoveryRedirectTarget", () => {
  it("sends a recovery link that landed elsewhere to the reset page", () => {
    expect(recoveryRedirectTarget("/admin", RECOVERY_HASH)).toBe(`/auth/reset${RECOVERY_HASH}`);
    expect(recoveryRedirectTarget("/", RECOVERY_HASH)).toBe(`/auth/reset${RECOVERY_HASH}`);
  });

  it("leaves a recovery link already on the reset page alone", () => {
    expect(recoveryRedirectTarget("/auth/reset", RECOVERY_HASH)).toBeNull();
  });

  it("ignores other sign-in links", () => {
    expect(recoveryRedirectTarget("/admin", "#access_token=abc&type=signup")).toBeNull();
    expect(recoveryRedirectTarget("/admin", "#access_token=abc&type=magiclink")).toBeNull();
  });

  it("ignores pages without a token", () => {
    expect(recoveryRedirectTarget("/", "")).toBeNull();
    expect(recoveryRedirectTarget("/writing", "#footnotes")).toBeNull();
    expect(recoveryRedirectTarget("/admin", "#type=recovery")).toBeNull();
  });
});
