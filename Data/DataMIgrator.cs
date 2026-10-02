using MyWebApi.Data;
using Microsoft.EntityFrameworkCore;

public static class DataMigrator
{
    public static async Task MigrateSqliteToPostgresAsync(
        IServiceProvider serviceProvider, 
        IConfiguration config)
    {
        // 1. Σύνδεση στην παλιά SQLite βάση
        var sqliteOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=app.db")
            .Options;

        using var sqliteDb = new AppDbContext(sqliteOptions);

        // 2. Σύνδεση στη νέα PostgreSQL βάση (μέσω DI)
        using var scope = serviceProvider.CreateScope();
        var postgresDb = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Βεβαιωνόμαστε ότι η Postgres έχει δημιουργηθεί με τα migrations
        await postgresDb.Database.MigrateAsync();

        // 3. Έλεγχος αν η Postgres είναι άδεια πριν τη μεταφορά
        if (await postgresDb.Categories.AnyAsync()) return;

        // 4. Ανάγνωση δεδομένων από την SQLite (χωρίς Tracking)
        var categories = await sqliteDb.Categories
            .AsNoTracking()
            .Include(c => c.Products)
            .ToListAsync();

        if (!categories.Any()) return;

        // 5. Εισαγωγή στην PostgreSQL
        await postgresDb.Categories.AddRangeAsync(categories);
        await postgresDb.SaveChangesAsync();

        Console.WriteLine("✅ Data migration from SQLite to Postgres has been successfully completed!");
    }
}