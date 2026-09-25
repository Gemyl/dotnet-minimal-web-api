using Microsoft.EntityFrameworkCore;
using MyWebApi.Data;
using MyWebApi.DTOs;
using MyWebApi.Filters;
using MyWebApi.Models;

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

    private static async Task<IResult> GetAllCagories(AppDbContext db)
    {
        var categories = await db.Categories
        .Select(c => new CategoryDto(c.Id, c.Name, c.Products.Select(p => new CategoryProductsDto(p.Id, p.Name, p.Price)).ToList()))
        .ToListAsync();

        return Results.Ok(categories);
    }

    private static async Task<IResult> GetCategoryById(AppDbContext db, Guid id)
    {
        var dto = await db.Categories
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Products.Select(p => new CategoryProductsDto(p.Id, p.Name, p.Price)).ToList()))
            .FirstOrDefaultAsync();

        if (dto == null) return Results.NotFound();

        return Results.Ok(dto);
    }

    private static async Task<IResult> CreateCategory(AppDbContext db, CreateCategoryDto dto)
    {
        var newCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = dto.Name
        };

        db.Categories.Add(newCategory);
        await db.SaveChangesAsync();

        return Results.Ok(newCategory);
    }

    private static async Task<IResult> UpdateCategory(AppDbContext db, UpdateCategoryDto dto)
    {
        var category = await db.Categories.Where(c => c.Id == dto.Id).FirstOrDefaultAsync();
        if (category is null) return Results.NotFound();

        category.Name = dto.Name;

        await db.SaveChangesAsync();

        var response = new UpdateCategoryDto(
            category.Id,
            category.Name
        );

        return Results.Ok(response);
    }

    private static async Task<IResult> DeleteCategory(AppDbContext db, Guid id)
    {
        var category = await db.Categories.Where(c => c.Id == id).FirstOrDefaultAsync();
        if (category is null) return Results.NotFound();

        db.Categories.Remove(category);
        await db.SaveChangesAsync();

        return Results.NoContent();
    }
}