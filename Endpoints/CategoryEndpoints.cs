using Microsoft.EntityFrameworkCore;
using MyWebApi.Data;
using MyWebApi.DTOs;
using MyWebApi.Filters;
using MyWebApi.Models;
using MyWebApi.Extensions;
using Microsoft.Extensions.Caching.Distributed;
using MyWebApi.Services;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/categories");

        group.MapGet("/", GetAllCagories).RequireAuthorization();
        group.MapGet("/{id:Guid}", GetCategoryById).RequireAuthorization();
        group.MapPost("/", CreateCategory).AddEndpointFilter<ValidationFilter<CreateCategoryDto>>().RequireAuthorization();
        group.MapPut("/", UpdateCategory).AddEndpointFilter<ValidationFilter<UpdateCategoryDto>>().RequireAuthorization();
        group.MapDelete("/{id:Guid}", DeleteCategory).RequireAuthorization();
    }

    private static async Task<IResult> GetAllCagories(
        AppDbContext db, 
        IDistributedCache cache,
        int page,
        int pageSize,
        bool all = false,
        string sortBy = "name",
        string sortDirection = "asc"
    )
    {
        var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        var normalizedSortBy = sortBy.ToLowerInvariant();
        var pageTag = page.ToString();
        var pageSizeTag = all ? "all" : pageSize.ToString();
        string cacheKey = $"categories:page-{page}:size-{pageSizeTag}:sort-{normalizedSortBy}-{(descending ? "desc" : "asc")}";
        var cachedResponse = await cache.GetRecordAsync<PagedResponseDto<CategoryDto>>(cacheKey);

        if (cachedResponse is not null)
        {
            return Results.Ok(cachedResponse);
        }

        var categoriesQuery = db.Categories.AsNoTracking();
        var query = (normalizedSortBy, descending) switch
        {
            ("name", true) => categoriesQuery.OrderByDescending(c => c.Name).ThenBy(c => c.Id),
            _ => categoriesQuery.OrderBy(c => c.Name).ThenBy(c => c.Id)
        };

        var totalItems = await query.CountAsync();
        var categories = new List<CategoryDto>();
        if (all)
        {
            categories = await query
            .Select(c => new CategoryDto(
                c.Id,
                c.Name
            ))
            .ToListAsync();
            ;
        } else
        {
            categories = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CategoryDto(
                c.Id, 
                c.Name
            ))
            .ToListAsync();
        }

        var response = new PagedResponseDto<CategoryDto>
        {
            Items = categories,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
        };

        await cache.SetRecordAsync(cacheKey, response);

        return Results.Ok(response);
    }

    private static async Task<IResult> GetCategoryById(
        AppDbContext db, 
        Guid id, 
        IDistributedCache cache
    )
    {
        string cacheKey = $"{id}";
        var cachedData = await cache.GetRecordAsync<CategoryDto>(cacheKey);

        if (cachedData is not null)
        {
            return Results.Ok(cachedData);
        }

        var dto = await db.Categories
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto(
                c.Id, 
                c.Name
            ))
            .FirstOrDefaultAsync();

        if (dto is not null) return Results.NotFound();

        await cache.SetRecordAsync(cacheKey, dto);

        return Results.Ok(dto);
    }

    private static async Task<IResult> CreateCategory(
        AppDbContext db, 
        CreateCategoryDto dto, 
        IDistributedCache cache,
        CacheService cacheService
    )
    {
        var newCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = dto.Name
        };

        db.Categories.Add(newCategory);
        await db.SaveChangesAsync();
        await cacheService.RemoveKeyByPatternAsync("redis_categories:*");

        return Results.Ok(newCategory.Id);
    }

    private static async Task<IResult> UpdateCategory(
        AppDbContext db, 
        UpdateCategoryDto dto, 
        IDistributedCache cache,
        CacheService cacheService
    )
    {
        var category = await db.Categories.Where(c => c.Id == dto.Id).FirstOrDefaultAsync();
        if (category is null) return Results.NotFound();

        category.Name = dto.Name;

        await db.SaveChangesAsync();
        await cache.RemoveAsync(category.Id.ToString());
        await cacheService.RemoveKeyByPatternAsync("redis_categories:*");

        return Results.Ok(category.Id);
    }

    private static async Task<IResult> DeleteCategory(
        AppDbContext db, 
        Guid id, 
        IDistributedCache cache,
        CacheService cacheService
    )
    {
        var category = await db.Categories.Where(c => c.Id == id).FirstOrDefaultAsync();
        if (category is null) return Results.NotFound();

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        await cache.RemoveAsync(id.ToString());
        await cacheService.RemoveKeyByPatternAsync("redis_categories:*");

        return Results.NoContent();
    }
}
