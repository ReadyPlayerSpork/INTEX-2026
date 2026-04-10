using Microsoft.AspNetCore.Identity;

namespace Haven_for_Her_Backend.Data
{
    public class AuthIdentityGenerator
    {
        public static async Task GenerateDefaultIdentityAsync(IServiceProvider serviceProvider, IConfiguration configuration)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

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
        
            var adminSection = configuration.GetSection("GenerateDefaultIdentityAdmin");
            var adminEmail = adminSection["Email"] ?? "admin@havenforher.local";
            var adminPassword = adminSection["Password"] ?? "admin!haven4her";

            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var createAdminResult = await userManager.CreateAsync(adminUser, adminPassword);
                if (!createAdminResult.Succeeded)
                {
                    throw new Exception($"Failed to create admin user: {string.Join(", ", createAdminResult.Errors.Select(e => e.Description))}");
                }
            }
            if (!await userManager.IsInRoleAsync(adminUser, AuthRoles.Admin))
            {
                var addToRoleResult = await userManager.AddToRoleAsync(adminUser, AuthRoles.Admin);
                if (!addToRoleResult.Succeeded)
                {
                    throw new Exception($"Failed to assign admin role to user: {string.Join(", ", addToRoleResult.Errors.Select(e => e.Description))}");
                }
            }

            if (!await userManager.IsInRoleAsync(adminUser, AuthRoles.Donor))
            {
                var addToRoleResult = await userManager.AddToRoleAsync(adminUser, AuthRoles.Donor);
                if (!addToRoleResult.Succeeded)
                {
                    throw new Exception($"Failed to assign donor role to user: {string.Join(", ", addToRoleResult.Errors.Select(e => e.Description))}");
                }
            }

            // ── Seeded counselor (matches CSV data for SW-15 residents) ──────────
            const string counselorEmail = "counselor@havenforher.local";
            const string counselorPassword = "Counselor!haven4her";

            var counselorUser = await userManager.FindByEmailAsync(counselorEmail);
            if (counselorUser == null)
            {
                counselorUser = new ApplicationUser
                {
                    UserName = counselorEmail,
                    Email = counselorEmail,
                    EmailConfirmed = true,
                };

                var createResult = await userManager.CreateAsync(counselorUser, counselorPassword);
                if (!createResult.Succeeded)
                {
                    throw new Exception($"Failed to create counselor user: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                }
            }

            if (!await userManager.IsInRoleAsync(counselorUser, AuthRoles.Counselor))
            {
                var addResult = await userManager.AddToRoleAsync(counselorUser, AuthRoles.Counselor);
                if (!addResult.Succeeded)
                {
                    throw new Exception($"Failed to assign Counselor role: {string.Join(", ", addResult.Errors.Select(e => e.Description))}");
                }
            }

            // ── Seeded donor (matches supporter email donor@havenforher.local in domain CSV) ──
            var donorSection = configuration.GetSection("GenerateDefaultIdentityDonor");
            var donorEmail = donorSection["Email"] ?? "donor@havenforher.local";
            var donorPassword = donorSection["Password"] ?? "Donor!haven4her";

            var donorUser = await userManager.FindByEmailAsync(donorEmail);
            if (donorUser == null)
            {
                donorUser = new ApplicationUser
                {
                    UserName = donorEmail,
                    Email = donorEmail,
                    EmailConfirmed = true,
                };

                var createDonor = await userManager.CreateAsync(donorUser, donorPassword);
                if (!createDonor.Succeeded)
                {
                    throw new Exception($"Failed to create donor user: {string.Join(", ", createDonor.Errors.Select(e => e.Description))}");
                }
            }

            if (!await userManager.IsInRoleAsync(donorUser, AuthRoles.Donor))
            {
                var addDonorRole = await userManager.AddToRoleAsync(donorUser, AuthRoles.Donor);
                if (!addDonorRole.Succeeded)
                {
                    throw new Exception($"Failed to assign Donor role: {string.Join(", ", addDonorRole.Errors.Select(e => e.Description))}");
                }
            }
        }
    }
}
