using StackExchange.Redis;

namespace MyWebApi.Services;

public class CacheService
{
    private readonly IConnectionMultiplexer _redis;

    public CacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

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
