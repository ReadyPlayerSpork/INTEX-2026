using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Haven_for_Her_Backend.Data
{
    public class AuthIdentityGenerator
    {
        public static async Task GenerateDefaultIdentityAsync(IServiceProvider serviceProvider, IConfiguration configuration)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var logger = serviceProvider.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(AuthIdentityGenerator));

            foreach (var roleName in AuthRoles.All)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    var createRoleResults = await roleManager.CreateAsync(new IdentityRole(roleName));

                    if (!createRoleResults.Succeeded)
                    {
                        throw new Exception($"Failed to create role '{roleName}': {string.Join(", ", createRoleResults.Errors.Select(e => e.Description))}");
                    }
                }
            }

            // ── Admin ───────────────────────────────────────────────────────────
            await EnsureSeededAccountAsync(
                userManager, logger, configuration,
                sectionName: "GenerateDefaultIdentityAdmin",
                roles: new[] { AuthRoles.Admin, AuthRoles.Donor },
                label: "admin");

            // ── Counselor (matches CSV data for SW-15 residents) ────────────────
            await EnsureSeededAccountAsync(
                userManager, logger, configuration,
                sectionName: "GenerateDefaultIdentityCounselor",
                roles: new[] { AuthRoles.Counselor },
                label: "counselor");

            // ── Donor (matches supporter email in domain CSV) ───────────────────
            await EnsureSeededAccountAsync(
                userManager, logger, configuration,
                sectionName: "GenerateDefaultIdentityDonor",
                roles: new[] { AuthRoles.Donor },
                label: "donor");
        }

        private static async Task EnsureSeededAccountAsync(
            UserManager<ApplicationUser> userManager,
            ILogger logger,
            IConfiguration configuration,
            string sectionName,
            string[] roles,
            string label)
        {
            var section = configuration.GetSection(sectionName);
            var email = section["Email"];
            var password = section["Password"];

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                logger.LogWarning(
                    "Skipping {Label} account — set {Section}__Email and {Section}__Password in environment/.env",
                    label, sectionName, sectionName);
                return;
            }

            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                };

                var result = await userManager.CreateAsync(user, password);
                if (!result.Succeeded)
                {
                    throw new Exception($"Failed to create {label} user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }

                logger.LogInformation("Created seeded {Label} account ({Email})", label, email);
            }

            foreach (var role in roles)
            {
                if (!await userManager.IsInRoleAsync(user, role))
                {
                    var addResult = await userManager.AddToRoleAsync(user, role);
                    if (!addResult.Succeeded)
                    {
                        throw new Exception($"Failed to assign {role} role to {label} user: {string.Join(", ", addResult.Errors.Select(e => e.Description))}");
                    }
                }
            }
        }
    }
}
