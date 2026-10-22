
using MyWebApi.Models;

public static class ProductsFiltering
{
    public static bool ApplyFilters(
        IQueryable<Product> query,
        List<ProductsFiltersDto> filters,
        out IQueryable<Product> filtered,
        out string? error
    )
    {
        filtered = query;
        error = null;

        foreach (var filter in filters)
        {
            try
            {
                string field = filter.Field.ToLowerInvariant();

                switch (field)
                {
                    case "name":
                    {
                        var value = filter.Value.GetString();

                        if (value is null)
                        {
                            error = "Invalid name filter value";
                            return false;
                        }

                        switch(filter.Operator)
                        {
                            case "contains":
                                filtered = filtered.Where(p => p.Name.Contains(value));
                                break;

                            case "equals":
                                filtered = filtered.Where(p => p.Name == value);
                                break;

                            default:
                                error = "Unsupported operator for field name";
                                return false;        
                        }

                        break;
                    }

                    case "price":
                    {
                        if (!filter.Value.TryGetDecimal(out var value))
                        {
                            error = "Price must be a number";
                            return false;
                        }

                        switch(filter.Operator)
                        {
                            case "equals":
                                filtered = filtered.Where(p => p.Price == value);
                                break;

                            case "greaterThan":
                                filtered = filtered.Where(p => p.Price > value);
                                break;

                            case "greaterThanOrEqual":
                                filtered = filtered.Where(p => p.Price >= value);
                                break;

                            case "lessThan":
                                filtered = filtered.Where(p => p.Price < value);
                                break;

                            case "lessThanOrEqual":
                                filtered = filtered.Where(p => p.Price <= value);
                                break;

                            default:
                                error = "Unsupported operator for field price";
                                return false;        
                        }

                        break;
                    }

                    case "category":
                    {
                        var value = filter.Value.GetString();
                        if (value is null)
                        {
                            error = "Price must be a number";
                            return false;
                        }

                        filtered = filtered.Where(p => p.CategoryId.ToString() == value);
                        break;
                    }

                    default:
                    {
                        error = "Invalid field.";
                        return false;        
                    }
                }
            }

            catch (InvalidOperationException)
            {
                error = $"Invalid operation for field: {filter.Field}";
                return false;
            }
        }

        return true;
    }
}