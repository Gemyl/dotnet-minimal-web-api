using Microsoft.EntityFrameworkCore;
using MyWebApi.Data;
using MyWebApi.Models;
using MyWebApi.DTOs;
using MyWebApi.Filters;
using MyWebApi.Extensions;
using Microsoft.Extensions.Caching.Distributed;

namespace MyWebApi.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/products");

        group.MapGet("/", GetAllProducts);
        group.MapGet("/{id:Guid}", GetProductById);
        group.MapPost("/", CreateProduct).AddEndpointFilter<ValidationFilter<CreateProductDto>>();
        group.MapPut("/", UpdateProduct);
        group.MapDelete("/{id:Guid}", DeleteProduct);
    }

    private static async Task<IResult> GetAllProducts(AppDbContext db, IDistributedCache cache)
    {
        string cacheKey = "products_all";
        var cachedData = await cache.GetRecordAsync<List<Product>>(cacheKey);

        if (cachedData is not null)
        {
            return Results.Ok(cachedData);
        }

        var products = await db.Products
        .AsNoTracking()
        .Select(p => new ProductDto(p.Id, p.Name, p.Price, p.CategoryId))
        .ToListAsync();

        await cache.SetRecordAsync(cacheKey, products, null);

        return Results.Ok(products);
    }

    private static async Task<IResult> GetProductById(Guid id, AppDbContext db, IDistributedCache cache)
    {
        string cacheKey = $"{id}";
        var cachedData = await cache.GetRecordAsync<Product>(cacheKey);

        if (cachedData is not null)
        {
            return Results.Ok(cachedData);
        }

        var product = await db.Products.FindAsync(id);

        if (product is not null)
        {
            await cache.SetRecordAsync(cacheKey, product);
            return Results.Ok(new ProductDto(product.Id, product.Name, product.Price, product.CategoryId));
        }

        return Results.NotFound();
    }

    private static async Task<IResult> CreateProduct(CreateProductDto newProduct, AppDbContext db, IDistributedCache cache)
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
        await cache.RemoveAsync("products_all");

        var responseDto = new ProductDto(product.Id, product.Name, product.Price, product.CategoryId);
        return Results.Ok(responseDto);
    }

    private static async Task<IResult> UpdateProduct(Product product, AppDbContext db, IDistributedCache cache)
    {
        var selectedProduct = await db.Products.FindAsync(product.Id);
        if (selectedProduct == null) return Results.NotFound();

        selectedProduct.Name = product.Name;
        selectedProduct.Price = product.Price;
        selectedProduct.CategoryId = product.CategoryId;

        await db.SaveChangesAsync();
        await cache.RemoveAsync(product.Id.ToString());
        await cache.RemoveAsync("products_all");

        var responseDto = new ProductDto(selectedProduct.Id, selectedProduct.Name, selectedProduct.Price, selectedProduct.CategoryId);
        return Results.Ok(responseDto);
    }

    private static async Task<IResult> DeleteProduct(Guid id, AppDbContext db, IDistributedCache cache)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return Results.Ok();

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        await cache.RemoveAsync(id.ToString());
        await cache.RemoveAsync("products_all");

        return Results.Ok(product.Id);
    }
}