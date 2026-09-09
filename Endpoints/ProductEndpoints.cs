using MyWebApi.Models;

namespace MyWebApi.Endpoints;

public static class ProductEndpoints
{
    private static readonly List<Product> _products =
    [
            new Product { Id = 1, Name = "Laptop", Price = 999.99m },
            new Product { Id = 2, Name = "Mouse", Price = 25.50m }
    ];

    public static void MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/products");

        group.MapGet("/", GetAllProducts);
        group.MapGet("/{id:int}", GetProductById);
        group.MapPost("/", CreateProduct);
        group.MapPut("/", UpdateProduct);
        group.MapDelete("/{id:int}", DeleteProduct);
    }

    private static IResult GetAllProducts() => Results.Ok(_products);

    private static IResult GetProductById(int id)
    {
        var selectedProduct = _products.FirstOrDefault((p) => p.Id == id);
        if (selectedProduct == null) return Results.NotFound();

        return Results.Ok(selectedProduct);
    }

    private static IResult CreateProduct(Product newProduct)
    {
        newProduct.Id = _products.Max((p) => p.Id) + 1;
        _products.Add(newProduct);

        return Results.Ok(newProduct);
    }

    private static IResult UpdateProduct(Product updatedProduct)
    {
        var selectedProduct = _products.FirstOrDefault((p) => p.Id == updatedProduct.Id);
        if (selectedProduct == null) return Results.NotFound();

        selectedProduct.Name = updatedProduct.Name;
        selectedProduct.Price = updatedProduct.Price;

        return Results.Ok(selectedProduct);
    }

    private static IResult DeleteProduct(int id)
    {
        var selectedProduct = _products.FirstOrDefault((p) => p.Id == id);
        if (selectedProduct == null) return Results.NotFound();

        _products.Remove(selectedProduct);

        return Results.Ok(selectedProduct.Id);
    }
}