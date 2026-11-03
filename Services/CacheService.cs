using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;

namespace MyWebApi.Services;

public class CacheService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IDistributedCache _cache;

    public CacheService(IConnectionMultiplexer redis, IDistributedCache cache)
    {
        _redis = redis;
        _cache = cache;
    }

    public async Task SetRecordAsync<T>(
        string id,
        T data,
        TimeSpan? absoluteTimeToExpire = null
    )
    {
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = absoluteTimeToExpire ?? TimeSpan.FromMinutes(5)
        };

        string dataSerialized = JsonSerializer.Serialize(data);
        await _cache.SetStringAsync(id, dataSerialized, options);
    }

    public async Task<T?> GetRecordAsync<T>(
        string id
    )
    {
        var recordSerialized = await _cache.GetStringAsync(id);

        if (recordSerialized is null)
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(recordSerialized);
    }

    public async Task RemoveAsync(string key, CancellationToken token = default) => await _cache.RemoveAsync(key, token);
    public async Task RemoveKeyByPatternAsync(string pattern)
    {
        var db = _redis.GetDatabase();
        var endpoints = _redis.GetEndPoints();

        foreach (var endpoint in endpoints)
        {
            var server = _redis.GetServer(endpoint);

            if (!server.IsConnected || server.IsReplica)
            {
                continue;
            }

            foreach (var key in server.Keys(pattern: pattern, pageSize: 500))
            {
                await db.KeyDeleteAsync(key);
            }        
        }  
    }
}
