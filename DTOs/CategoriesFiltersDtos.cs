
using System.Text.Json;

public sealed record CategoriesFilterDto(
    string Field,
    string Operator,
    JsonElement Value
);