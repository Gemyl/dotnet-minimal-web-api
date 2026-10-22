using System.Text.Json;

public sealed record ProductsFiltersDto(
    string Field,
    string Operator,
    JsonElement Value
);