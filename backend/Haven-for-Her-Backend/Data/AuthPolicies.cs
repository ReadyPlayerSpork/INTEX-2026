namespace Haven_for_Her_Backend.Data;

public static class AuthPolicies
{
    public const string RequireAdmin = nameof(RequireAdmin);
    public const string RequireFinancial = nameof(RequireFinancial);
    public const string RequireCounselor = nameof(RequireCounselor);
    public const string RequireSocialMedia = nameof(RequireSocialMedia);
    public const string RequireDonor = nameof(RequireDonor);
    public const string RequireSurvivor = nameof(RequireSurvivor);
    public const string RequireEmployee = nameof(RequireEmployee);
}
