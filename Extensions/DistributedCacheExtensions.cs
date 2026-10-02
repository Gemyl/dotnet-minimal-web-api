using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace MyWebApi.Extensions;

public static class DistributedCacheExtensions
{
    public static async Task SetRecordAsync<T>(
        this IDistributedCache cache,
        string recordId,
        T data,
        TimeSpan? absoluteTimeExpire = null)
    {
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = absoluteTimeExpire ?? TimeSpan.FromMinutes(5)
        };

        var jsonData = JsonSerializer.Serialize(data);
        await cache.SetStringAsync(recordId, jsonData, options);
    }

    public static async Task<T?> GetRecordAsync<T>(
        this IDistributedCache cache,
        string recordId)
    {
        var jsonData = await cache.GetStringAsync(recordId);
        if (jsonData is null)
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(jsonData);
    }
}
