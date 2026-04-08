namespace Haven_for_Her_Backend.Infrastructure
{
    public static class SecurityHeaders
    {
        public const string ContentSecurityPolicy = "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'";

        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        {
            var environment = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
            return app.Use(async (context, next) =>
            {
                context.Response.OnStarting(() =>
                {
                    if (!(environment.IsDevelopment() && context.Request.Path.StartsWithSegments("/openapi")))
                    {
                        context.Response.Headers["Content-Security-Policy"] = ContentSecurityPolicy;
                    }

                    context.Response.Headers["X-Frame-Options"] = "DENY";
                    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
                    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

                    return Task.CompletedTask;
                });
                await next();
            });
        }

    }
}