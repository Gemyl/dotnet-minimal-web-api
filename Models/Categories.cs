namespace MyWebApi.Models;

public class Category
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public List<Product> Products { get; set; } = [];
}