using Microsoft.EntityFrameworkCore;

namespace Intex_Placeholder.Data;

public class IntexPlaceholderDbContext : DbContext
{
    public IntexPlaceholderDbContext(DbContextOptions<IntexPlaceholderDbContext> options) : base(options)
    {
    }

    // Add your DbSet properties here, e.g.:
    // public DbSet<Movie> Movies { get; set; }
}