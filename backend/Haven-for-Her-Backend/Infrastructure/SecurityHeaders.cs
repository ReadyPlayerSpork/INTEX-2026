namespace Haven_for_Her_Backend.Infrastructure
{
    /// <summary>
    /// Injects security-related HTTP response headers on every response.
    /// These headers provide defense-in-depth against XSS, clickjacking,
    /// MIME-sniffing, and other common web attacks (IS 414: CSP requirement).
    /// </summary>
    public static class SecurityHeaders
    {
        // Content-Security-Policy (CSP):
        //   default-src 'self'       → only load resources from our own origin
        //   base-uri 'self'          → prevent <base> tag hijacking
        //   frame-ancestors 'none'   → block embedding in iframes (clickjacking)
        //   object-src 'none'        → block Flash/Java plugins
        public const string ContentSecurityPolicy = "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'";

        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        {
            var environment = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
            return app.Use(async (context, next) =>
            {
                context.Response.OnStarting(() =>
                {
                    // Skip CSP for the OpenAPI doc in dev so Swagger-like tools work
                    if (!(environment.IsDevelopment() && context.Request.Path.StartsWithSegments("/openapi")))
                    {
                        context.Response.Headers["Content-Security-Policy"] = ContentSecurityPolicy;
                    }

                    context.Response.Headers["X-Frame-Options"] = "DENY";               // clickjacking defense
                    context.Response.Headers["X-Content-Type-Options"] = "nosniff";      // MIME-sniffing defense
                    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin"; // limit referrer leakage
                    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"; // disable device APIs

                    return Task.CompletedTask;
                });
                await next();
            });
        }

    }
}