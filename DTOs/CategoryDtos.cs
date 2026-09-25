namespace MyWebApi.DTOs;

public record CreateCategoryDto(string Name);
public record UpdateCategoryDto(Guid Id, string Name);
public record CategoryProductsDto(Guid Id, string Name, decimal Price);
public record CategoryDto(Guid Id, string Name, List<CategoryProductsDto> Products);