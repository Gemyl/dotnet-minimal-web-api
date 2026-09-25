namespace MyWebApi.DTOs;

public record CreateProductDto(string Name, decimal Price, Guid CategoryId);
public record UpdateProductDto(string Name, decimal Price, Guid CategoryId);
public record ProductDto(Guid Id, string Name, decimal Price, Guid CategoryId);
