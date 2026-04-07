using Microsoft.EntityFrameworkCore;
using Haven_for_Her_Backend.Data;
using Microsoft.AspNetCore.Identity;
using Haven_for_Her_Backend.Infrastructure;
using Microsoft.AspNetCore.Authentication.Google;

var builder = WebApplication.CreateBuilder(args);
const string FrontendCorsPolicy = "FrontendClient";
const string DefaultFrontendUrl = "http://localhost:5173";
var frontendUrls = (builder.Configuration["FrontendUrls"] ?? builder.Configuration["FrontendUrl"] ?? DefaultFrontendUrl)
    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<HavenForHerBackendDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("HavenForHerBackendAuthConnection")));

builder.Services.AddDbContext<AuthIdentityDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("HavenForHerBackendIdentityConnection")));

builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AuthIdentityDbContext>();

if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
{
    builder.Services.AddAuthentication()
        .AddGoogle(options =>
        {
            options.ClientId = googleClientId;
            options.ClientSecret = googleClientSecret;
            options.SignInScheme = IdentityConstants.ExternalScheme;
            options.CallbackPath = "/signin-google";
        });
}

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthPolicies.RequireAdmin, p => p.RequireRole(AuthRoles.Admin));
    options.AddPolicy(AuthPolicies.RequireFinancial, p => p.RequireRole(AuthRoles.Financial));
    options.AddPolicy(AuthPolicies.RequireCounselor, p => p.RequireRole(AuthRoles.Counselor));
    options.AddPolicy(AuthPolicies.RequireSocialMedia, p => p.RequireRole(AuthRoles.SocialMedia));
    options.AddPolicy(AuthPolicies.RequireDonor, p => p.RequireRole(AuthRoles.Donor));
    options.AddPolicy(AuthPolicies.RequireSurvivor, p => p.RequireRole(AuthRoles.Survivor));
    options.AddPolicy(AuthPolicies.RequireEmployee, p => p.RequireRole(AuthRoles.Employee));
});

builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 14;
    options.Password.RequiredUniqueChars = 1;
});

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(frontendUrls)
            .AllowCredentials()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    await AuthIdentityGenerator.GenerateDefaultIdentityAsync(scope.ServiceProvider, app.Configuration);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSecurityHeaders();

app.UseCors(FrontendCorsPolicy);

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

// Identity login/register endpoints under /api/auth (used by AccountController and direct login)
app.MapGroup("/api/auth").MapIdentityApi<ApplicationUser>();

app.Run();
