using Microsoft.EntityFrameworkCore;
using MyWebApi.Data;
using MyWebApi.Models;
using MyWebApi.DTOs;
using MyWebApi.Fitlers;

namespace MyWebApi.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/products");

        group.MapGet("/", GetAllProducts);
        group.MapGet("/{id:int}", GetProductById);
        group.MapPost("/", CreateProduct).AddEndpointFilter<ValidationFilter<CreateProductDto>>();
        group.MapPut("/", UpdateProduct);
        group.MapDelete("/{id:int}", DeleteProduct);
    }

    private static async Task<IResult> GetAllProducts(AppDbContext db)
    {
        var products = await db.Products
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .ToListAsync();

        return Results.Ok(products);
    }

    private static async Task<IResult> GetProductById(int id, AppDbContext db)
    {
        var product = await db.Products.FindAsync(id);
        return product is not null 
        ? Results.Ok(new ProductDto(product.Id, product.Name, product.Price)) 
        : Results.NotFound();
    }

    private static async Task<IResult> CreateProduct(CreateProductDto newProduct, AppDbContext db)
    {
        var product = new Product
        {
            Name = newProduct.Name,
            Price = newProduct.Price
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        var responseDto = new ProductDto(product.Id, product.Name, product.Price);
        return Results.Ok(responseDto);
    }

    private static async Task<IResult> UpdateProduct(Product product, AppDbContext db)
    {
        var selectedProduct = await db.Products.FindAsync(product.Id);
        if (selectedProduct == null) return Results.NotFound();

        selectedProduct.Name = product.Name;
        selectedProduct.Price = product.Price;

        await db.SaveChangesAsync();

        var responseDto = new ProductDto(selectedProduct.Id, selectedProduct.Name, selectedProduct.Price);
        return Results.Ok(responseDto);
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