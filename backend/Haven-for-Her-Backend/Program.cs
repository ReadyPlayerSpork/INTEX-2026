using Microsoft.EntityFrameworkCore;
using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Services;
using Microsoft.AspNetCore.Identity;
using Haven_for_Her_Backend.Infrastructure;
using Microsoft.AspNetCore.Authentication.Google;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);
const string FrontendCorsPolicy = "FrontendClient";
const string DefaultFrontendUrl = "https://localhost:5173";
var frontendUrls = (builder.Configuration["FrontendUrls"] ?? builder.Configuration["FrontendUrl"] ?? DefaultFrontendUrl)
    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
Console.WriteLine($"CORS allowed origins: {string.Join(", ", frontendUrls)}");
var configuredPublicBaseUrl = builder.Configuration["PublicBaseUrl"];
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<HavenForHerBackendDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("HavenForHerBackendAuthConnection")));

builder.Services.AddDbContext<AuthIdentityDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("HavenForHerBackendIdentityConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AuthIdentityDbContext>()
    .AddDefaultTokenProviders();

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

    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
});

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
    options.Events.OnRedirectToLogin = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
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

// Behind Cloudflare Tunnel / Docker, the container sees plain HTTP; the edge sends X-Forwarded-Proto: https.
// .NET 8+ ignores forwarded headers from "unknown" proxies unless trusted proxy lists are cleared
// (see https://learn.microsoft.com/en-us/dotnet/core/compatibility/aspnet-core/8.0/forwarded-headers-unknown-proxies).
// Clearing lets OAuth build redirect_uri with https:// so Google accepts the callback.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = null;
    options.RequireHeaderSymmetry = false;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("auth", o =>
    {
        o.Window = TimeSpan.FromMinutes(1);
        o.PermitLimit = 100;
        o.QueueLimit = 0;
    });
});

builder.Services.AddHttpClient("MlService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["MlService:BaseUrl"] ?? "http://localhost:5050");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddHostedService<MLRetrainSchedulerService>();

// ── Meta Ads API ───────────────────────────────────────────────────────────
// Config is loaded from environment variables or appsettings (double-underscore → colon mapping).
// Set META_SYSTEM_USER_TOKEN, META_AD_ACCOUNT_ID, META_PAGE_ID, etc.
var metaAdsConfig = new MetaAdsConfig
{
    AccessToken = builder.Configuration["META_SYSTEM_USER_TOKEN"] ?? "",
    AdAccountId = builder.Configuration["META_AD_ACCOUNT_ID"] ?? "",
    PageId = builder.Configuration["META_PAGE_ID"] ?? "",
    AppId = builder.Configuration["META_APP_ID"] ?? "",
    AppSecret = builder.Configuration["META_APP_SECRET"] ?? "",
    ApiVersion = builder.Configuration["META_GRAPH_API_VERSION"] ?? "v20.0",
};
builder.Services.AddSingleton(metaAdsConfig);

builder.Services.AddHttpClient<MetaAdsService>(client =>
{
    client.BaseAddress = new Uri("https://graph.facebook.com/");
    client.Timeout = TimeSpan.FromSeconds(60);
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var domainDb = scope.ServiceProvider.GetRequiredService<HavenForHerBackendDbContext>();
    await domainDb.Database.MigrateAsync();

    var identityDb = scope.ServiceProvider.GetRequiredService<AuthIdentityDbContext>();
    await identityDb.Database.MigrateAsync();

    await AuthIdentityGenerator.GenerateDefaultIdentityAsync(scope.ServiceProvider, app.Configuration);

    // ── CSV seeding: only run when REFRESH=true OR the domain DB is empty ──
    var refreshEnv = app.Configuration["REFRESH"];
    var forceRefresh = string.Equals(refreshEnv, "true", StringComparison.OrdinalIgnoreCase);
    var isDomainEmpty = !await domainDb.Safehouses.AnyAsync();

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var seedLogger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("CsvDataSeeder");
    var supporterPassword = app.Configuration["SeedSupporterPassword"];

    if (forceRefresh || isDomainEmpty)
    {
        seedLogger.LogInformation(
            "CSV seed gate: REFRESH raw={RefreshRaw}, forceRefresh={Force}, domainEmpty={Empty}, ContentRoot={Root}, BaseDir={Base}",
            refreshEnv ?? "(null)",
            forceRefresh,
            isDomainEmpty,
            app.Environment.ContentRootPath,
            AppContext.BaseDirectory);

        if (forceRefresh)
            seedLogger.LogInformation("REFRESH=true — will wipe and re-seed domain data when CSV seed runs");
        else
            seedLogger.LogInformation("Domain tables are empty — running initial seed");

        // Common layouts: SDK publish, Railpack/Dokploy /app, cwd, plus explicit /app fallbacks.
        var candidatePaths = new[]
        {
            Path.Combine(app.Environment.ContentRootPath, "docs", "lighthouse_csv_v7"),
            Path.Combine(AppContext.BaseDirectory, "docs", "lighthouse_csv_v7"),
            Path.Combine(Directory.GetCurrentDirectory(), "docs", "lighthouse_csv_v7"),
            "/app/docs/lighthouse_csv_v7",
            Path.Combine("/app", "publish", "docs", "lighthouse_csv_v7"),
        };

        var csvDir = candidatePaths.FirstOrDefault(Directory.Exists);
        if (csvDir is null)
        {
            var msg =
                "CSV directory not found — cannot seed. Tried: " + string.Join("; ", candidatePaths) +
                $". ContentRootPath={app.Environment.ContentRootPath}, BaseDirectory={AppContext.BaseDirectory}, cwd={Directory.GetCurrentDirectory()}";
            seedLogger.LogError("{Message}", msg);
            // Do not start serving an empty org after REFRESH or first deploy; fail the process so logs/Dokploy show the error.
            throw new InvalidOperationException(msg);
        }

        seedLogger.LogInformation("CSV directory resolved to {CsvDir}", csvDir);
        try
        {
            await CsvDataSeeder.SeedAsync(domainDb, userManager, csvDir, supporterPassword, seedLogger);
        }
        catch (Exception ex)
        {
            seedLogger.LogError(ex, "CSV seeding FAILED — process will exit so the DB is not left partially empty");
            throw;
        }
    }
    else
    {
        seedLogger.LogInformation("Domain data exists and REFRESH is not set — skipping CSV seed");
    }

    var seqLogger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("PostgresSequenceSync");
    await CsvDataSeeder.ResyncPostgresIdentitySequencesAsync(domainDb, seqLogger);
}

// Configure the HTTP request pipeline.

// Must be early in the pipeline so Request.Scheme/Host reflect the public URL (see Configure<ForwardedHeadersOptions> above).
app.UseForwardedHeaders();

// Cloudflare Tunnel / Traefik often forward plain HTTP to the container; the last hop may set X-Forwarded-Proto=http
// or omit it, so OAuth still builds redirect_uri with http://. Set PublicBaseUrl (e.g. https://api.example.com) in
// production to upgrade matching requests to that scheme so Google OAuth accepts the callback.
if (!string.IsNullOrWhiteSpace(configuredPublicBaseUrl)
    && Uri.TryCreate(configuredPublicBaseUrl.Trim(), UriKind.Absolute, out var publicOriginUri))
{
    var expectedHost = publicOriginUri.Host;
    app.Use(async (context, next) =>
    {
        if (string.Equals(context.Request.Host.Host, expectedHost, StringComparison.OrdinalIgnoreCase)
            && string.Equals(context.Request.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase))
        {
            context.Request.Scheme = publicOriginUri.Scheme;
            context.Request.Host = publicOriginUri.IsDefaultPort
                ? new HostString(publicOriginUri.Host)
                : new HostString(publicOriginUri.Host, publicOriginUri.Port);
        }

        await next();
    });
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Note: HSTS and HTTPS redirection are intentionally omitted.
// Cloudflare Tunnel handles TLS termination externally; adding them here
// would cause redirect loops since the container only receives plain HTTP.

app.UseSecurityHeaders();

app.UseCors(FrontendCorsPolicy);

app.UseRateLimiter();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();


app.Run();
