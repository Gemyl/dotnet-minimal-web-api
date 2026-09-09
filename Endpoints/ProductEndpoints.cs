using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Data;
using MyWebApi.Models;

namespace MyWebApi.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/products");

        group.MapGet("/", GetAllProducts);
        group.MapGet("/{id:int}", GetProductById);
        group.MapPost("/", CreateProduct);
        group.MapPut("/", UpdateProduct);
        group.MapDelete("/{id:int}", DeleteProduct);
    }

    private static async Task<IResult> GetAllProducts(AppDbContext db)
    {
        var products = await db.Products.ToListAsync();
        return Results.Ok(products);
    }

    private static async Task<IResult> GetProductById(int id, AppDbContext db)
    {
        var product = await db.Products.FindAsync(id);
        return product is not null ? Results.Ok(product) : Results.NotFound();
    }

    private static async Task<IResult> CreateProduct(Product newProduct, AppDbContext db)
    {
        db.Products.Add(newProduct);
        await db.SaveChangesAsync();
        return Results.Ok(newProduct);
    }

    private static async Task<IResult> UpdateProduct(Product updatedProduct, AppDbContext db)
    {
        var product = await db.Products.FindAsync(updatedProduct.Id);
        if (product == null) return Results.NotFound();

        product.Name = updatedProduct.Name;
        product.Price = updatedProduct.Price;

        await db.SaveChangesAsync();
        return Results.Ok(product);
    }

    private static async Task<IResult> DeleteProduct(int id, AppDbContext db)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return Results.Ok();

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return Results.Ok(product.Id);
    }
}