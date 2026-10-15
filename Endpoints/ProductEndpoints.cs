using Microsoft.EntityFrameworkCore;
using MyWebApi.Data;
using MyWebApi.Models;
using MyWebApi.DTOs;
using MyWebApi.Filters;
using MyWebApi.Extensions;
using MyWebApi.Services;
using Microsoft.Extensions.Caching.Distributed;
namespace MyWebApi.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/products");

        group.MapGet("/", GetAllProducts).RequireAuthorization();
        group.MapGet("/{id:Guid}", GetProductById).RequireAuthorization();
        group.MapPost("/", CreateProduct).AddEndpointFilter<ValidationFilter<CreateProductDto>>().RequireAuthorization();
        group.MapPut("/", UpdateProduct).AddEndpointFilter<ValidationFilter<UpdateProductDto>>().RequireAuthorization();
        group.MapDelete("/{id:Guid}", DeleteProduct).RequireAuthorization();
    }

    private static async Task<IResult> GetAllProducts(
        AppDbContext db, 
        IDistributedCache cache, 
        int page, 
        int pageSize
    )
    {

        string cacheKey = $"products:page-{page}:size-{pageSize}";
        var cachedResponse = await cache.GetRecordAsync<PagedResponseDto<ProductDto>>(cacheKey);

        if (cachedResponse is not null)
        {
            return Results.Ok(cachedResponse);
        }

        var query = db.Products
        .AsNoTracking()
        .OrderBy(p => p.Id);

        var totalItems = await query.CountAsync();

        var products = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(p => new ProductDto(
            p.Id, 
            p.Name, 
            p.Price, 
            p.CategoryId
        ))
        .ToListAsync();
        
        var response = new PagedResponseDto<ProductDto>
        {
            Items = products,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };

        await cache.SetRecordAsync(cacheKey, response, null);
        
        return Results.Ok(response);
    }

    private static async Task<IResult> GetProductById(
        Guid id, 
        AppDbContext db, 
        IDistributedCache cache
    )
    {
        string cacheKey = $"{id}";
        var cachedData = await cache.GetRecordAsync<ProductDto>(cacheKey);

        if (cachedData is not null)
        {
            return Results.Ok(cachedData);
        }

        var product = await db.Products.FindAsync(id);

        if (product is not null)
        {
            await cache.SetRecordAsync(cacheKey, product);
            return Results.Ok(new ProductDto(
                product.Id, 
                product.Name, 
                product.Price, 
                product.CategoryId
            ));
        }

        return Results.NotFound();
    }

    private static async Task<IResult> CreateProduct(
        CreateProductDto newProduct, 
        AppDbContext db, 
        IDistributedCache cache,
        CacheService cacheService
    )
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = newProduct.Name,
            Price = newProduct.Price,
            CategoryId = newProduct.CategoryId
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();
        await cacheService.RemoveKeyByPatternAsync("redis_products:*");

        var responseDto = new ProductDto(
            product.Id, 
            product.Name, 
            product.Price, 
            product.CategoryId
        );
        return Results.Ok(responseDto);
    }

    private static async Task<IResult> UpdateProduct(
        Product product, 
        AppDbContext db, 
        IDistributedCache cache,
        CacheService cacheService
    )
    {
        var selectedProduct = await db.Products.FindAsync(product.Id);
        if (selectedProduct == null) return Results.NotFound();

        selectedProduct.Name = product.Name;
        selectedProduct.Price = product.Price;
        selectedProduct.CategoryId = product.CategoryId;

        await db.SaveChangesAsync();
        await cache.RemoveAsync(product.Id.ToString());
        await cacheService.RemoveKeyByPatternAsync("redis_products:*");

        var responseDto = new ProductDto(
            selectedProduct.Id, 
            selectedProduct.Name, 
            selectedProduct.Price, 
            selectedProduct.CategoryId
        );
        return Results.Ok(responseDto);
    }

    private static async Task<IResult> DeleteProduct(
        Guid id, 
        AppDbContext db, 
        IDistributedCache cache,
        CacheService cacheService
    )
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return Results.Ok();

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        await cache.RemoveAsync(id.ToString());
        await cacheService.RemoveKeyByPatternAsync("redis_products:*");

        return Results.Ok(product.Id);
    }
}