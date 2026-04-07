namespace Haven_for_Her_Backend.Dtos;

public record LoginRequest(string Email, string Password);

public record LoginTwoFactorRequest(string Email, string Code);

public record TwoFactorSetupResponse(string SharedKey, string AuthenticatorUri);

public record TwoFactorVerifyRequest(string Code);

public record TwoFactorStatusResponse(bool IsEnabled);
