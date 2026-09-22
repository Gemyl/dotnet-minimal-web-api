namespace MyWebApi.Models;

public class Product
{
    public required Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
}