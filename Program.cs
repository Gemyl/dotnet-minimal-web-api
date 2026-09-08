using MyWebApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var products = new List<Product>
{
    new Product { Id = 1, Name = "Laptop", Price = 999.99m },
    new Product { Id = 2, Name = "Mouse", Price = 25.50m }
};

app.MapGet("/api/products", () => Results.Ok(products));

app.MapGet("/api/products/{id:int}", (int id) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);
    return product is not null ? Results.Ok(product) : Results.NotFound();
});

app.MapPost("/api/products", (Product newProduct) => 
{
    newProduct.Id = products.Max(p => p.Id) + 1;
    products.Add(newProduct);
    return Results.Created($"/api/products/{newProduct.Id}", newProduct);
});

app.MapPut("/api/products", (Product product) =>
{
    var selectedProduct = products.FirstOrDefault((p) => p.Id == product.Id);
    if (selectedProduct == null)
    {
        return Results.NotFound();
    }

    selectedProduct.Name = product.Name;
    selectedProduct.Price = product.Price;

    return Results.Ok(selectedProduct);
});

app.MapDelete("/api/products/{id:int}", (int id) =>
{
    var productToRemove = products.FirstOrDefault((p) => p.Id == id);
    if(productToRemove != null)
    {
        products.Remove(productToRemove);
        return Results.Ok(id);
    } else
    {
        return Results.NotFound();
    }
});

app.Run();
