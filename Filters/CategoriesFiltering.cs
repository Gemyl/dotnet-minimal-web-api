using MyWebApi.Models;

public static class CategoriesFiltering
{
    public static bool ApplyFilters(
        IQueryable<Category> query,
        List<CategoriesFilterDto> filterDtos,
        out IQueryable<Category> filtered,
        out string? error
    )
    {
        filtered = query;
        error = null;

        foreach (var filter in filterDtos)
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
                                error = "Invalid value for field name.";
                                return false;
                            }

                            switch (filter.Operator)
                            {
                                case "equals":
                                    {
                                        filtered = filtered.Where(c => c.Name == value);
                                        break;
                                    }

                                case "contains":
                                    {
                                        filtered = filtered.Where(c => c.Name.Contains(value));
                                        break;
                                    }

                                default:
                                    {
                                        error = "Invalid operator for field name.";
                                        return false;
                                    }
                            }

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
                error = $"Invalid operation for field {filter.Field}";
                return false;
            }
        }

        return true;
    }
}