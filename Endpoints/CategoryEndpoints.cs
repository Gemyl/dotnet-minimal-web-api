using Microsoft.EntityFrameworkCore;
using MyWebApi.Data;
using MyWebApi.DTOs;
using MyWebApi.Filters;
using MyWebApi.Models;
using MyWebApi.Extensions;
using Microsoft.Extensions.Caching.Distributed;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/categories");

        group.MapGet("/", GetAllCagories);
        group.MapGet("/{id:Guid}", GetCategoryById);
        group.MapPost("/", CreateCategory).AddEndpointFilter<ValidationFilter<CreateCategoryDto>>();
        group.MapPut("/", UpdateCategory).AddEndpointFilter<ValidationFilter<UpdateCategoryDto>>();
        group.MapDelete("/{id:Guid}", DeleteCategory);
    }

    private static async Task<IResult> GetAllCagories(AppDbContext db, IDistributedCache cache)
    {
        string cacheKey = "categories_all";
        var cachedData = await cache.GetRecordAsync<List<Category>>(cacheKey);

        if (cachedData is not null)
        {
            return Results.Ok(cachedData);
        }

        var categories = await db.Categories
        .AsNoTracking()
        .Select(c => new CategoryDto(c.Id, c.Name, c.Products.Select(p => new CategoryProductsDto(p.Id, p.Name, p.Price)).ToList()))
        .ToListAsync();

        await cache.SetRecordAsync(cacheKey, categories);

        return Results.Ok(categories);
    }

    private static async Task<IResult> GetCategoryById(AppDbContext db, Guid id, IDistributedCache cache)
    {
        string cacheKey = $"{id}";
        var cachedData = await cache.GetRecordAsync<Category>(cacheKey);

        if (cachedData is not null)
        {
            return Results.Ok(cachedData);
        }

        var dto = await db.Categories
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Products.Select(p => new CategoryProductsDto(p.Id, p.Name, p.Price)).ToList()))
            .FirstOrDefaultAsync();

        if (dto is not null) return Results.NotFound();

        await cache.SetRecordAsync(cacheKey, dto);

        return Results.Ok(dto);
    }

    private static async Task<IResult> CreateCategory(AppDbContext db, CreateCategoryDto dto, IDistributedCache cache)
    {
        var newCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = dto.Name
        };

        db.Categories.Add(newCategory);
        await db.SaveChangesAsync();
        await cache.RemoveAsync("categories_all");

        return Results.Ok(newCategory.Id);
    }

    private static async Task<IResult> UpdateCategory(AppDbContext db, UpdateCategoryDto dto, IDistributedCache cache)
    {
        var category = await db.Categories.Where(c => c.Id == dto.Id).FirstOrDefaultAsync();
        if (category is null) return Results.NotFound();

        category.Name = dto.Name;

        await db.SaveChangesAsync();
        await cache.RemoveAsync(category.Id.ToString());
        await cache.RemoveAsync("categories_all");

        return Results.Ok(category.Id);
    }

    private static async Task<IResult> DeleteCategory(AppDbContext db, Guid id, IDistributedCache cache)
    {
        var category = await db.Categories.Where(c => c.Id == id).FirstOrDefaultAsync();
        if (category is null) return Results.NotFound();

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        await cache.RemoveAsync(id.ToString());
        await cache.RemoveAsync("categories_all");

        return Results.NoContent();
    }
}