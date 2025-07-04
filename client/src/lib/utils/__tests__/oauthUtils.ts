import {
  generateOAuthErrorDescription,
  parseOAuthCallbackParams,
  oauthAuthServerMetadataUrl,
} from "@/lib/utils/auth/oauthUtils";

describe("parseOAuthCallbackParams", () => {
  it("Returns successful: true and code when present", () => {
    expect(parseOAuthCallbackParams("?code=fake-code")).toEqual({
      successful: true,
      code: "fake-code",
    });
  });
  it("Returns successful: false and error when error is present", () => {
    expect(parseOAuthCallbackParams("?error=access_denied")).toEqual({
      successful: false,
      error: "access_denied",
      error_description: null,
      error_uri: null,
    });
  });
  it("Returns optional error metadata fields when present", () => {
    const search =
      "?error=access_denied&" +
      "error_description=User%20Denied%20Request&" +
      "error_uri=https%3A%2F%2Fexample.com%2Ferror-docs";
    expect(parseOAuthCallbackParams(search)).toEqual({
      successful: false,
      error: "access_denied",
      error_description: "User Denied Request",
      error_uri: "https://example.com/error-docs",
    });
  });
  it("Returns error when nothing present", () => {
    expect(parseOAuthCallbackParams("?")).toEqual({
      successful: false,
      error: "invalid_request",
      error_description: "Missing code or error in response",
      error_uri: null,
    });
  });
});

describe("generateOAuthErrorDescription", () => {
  it("When only error is present", () => {
    expect(
      generateOAuthErrorDescription({
        successful: false,
        error: "invalid_request",
        error_description: null,
        error_uri: null,
      }),
    ).toBe("Error: invalid_request.");
  });
  it("When error description is present", () => {
    expect(
      generateOAuthErrorDescription({
        successful: false,
        error: "invalid_request",
        error_description: "The request could not be completed as dialed",
        error_uri: null,
      }),
    ).toEqual(
      "Error: invalid_request.\nDetails: The request could not be completed as dialed.",
    );
  });
  it("When all fields present", () => {
    expect(
      generateOAuthErrorDescription({
        successful: false,
        error: "invalid_request",
        error_description: "The request could not be completed as dialed",
        error_uri: "https://example.com/error-docs",
      }),
    ).toEqual(
      "Error: invalid_request.\nDetails: The request could not be completed as dialed.\nMore info: https://example.com/error-docs.",
    );
  });
});

describe("oauthAuthServerMetadataUrl", () => {
  it("Returns metadata URL for simple auth server URL", () => {
    const input = new URL("https://auth.example.com");
    const result = oauthAuthServerMetadataUrl(input);
    expect(result.href).toBe(
      "https://auth.example.com/.well-known/oauth-authorization-server",
    );
  });

  it("Returns metadata URL for auth server with path", () => {
    const input = new URL("https://auth.example.com/oauth/tenant/xyz");
    const result = oauthAuthServerMetadataUrl(input);
    expect(result.href).toBe(
      "https://auth.example.com/.well-known/oauth-authorization-server/oauth/tenant/xyz",
    );
  });

  it("Strips trailing slash from path as per spec", () => {
    const input = new URL("https://auth.example.com/oauth/");
    const result = oauthAuthServerMetadataUrl(input);
    expect(result.href).toBe(
      "https://auth.example.com/.well-known/oauth-authorization-server/oauth",
    );
  });

  it("Handles auth server URL with port", () => {
    const input = new URL("https://auth.example.com:8080");
    const result = oauthAuthServerMetadataUrl(input);
    expect(result.href).toBe(
      "https://auth.example.com:8080/.well-known/oauth-authorization-server",
    );
  });
});
