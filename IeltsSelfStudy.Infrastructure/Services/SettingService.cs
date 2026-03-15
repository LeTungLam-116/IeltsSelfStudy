using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Infrastructure.Services;

public class SettingService : ISettingService
{
    private readonly IGenericRepository<SystemSetting> _repo;
    private readonly IMemoryCache _cache;
    private readonly ILogger<SettingService> _logger;
    private const string CACHE_KEY_PREFIX = "SystemSetting_";
    private const string ALL_SETTINGS_CACHE_KEY = "SystemSettings_All";

    public SettingService(
        IGenericRepository<SystemSetting> repo,
        IMemoryCache cache,
        ILogger<SettingService> logger)
    {
        _repo = repo;
        _cache = cache;
        _logger = logger;
    }

    public async Task<string> GetAsync(string key, string defaultValue = "")
    {
        string cacheKey = $"{CACHE_KEY_PREFIX}{key}";
        
        if (_cache.TryGetValue(cacheKey, out string? cachedValue))
        {
            return cachedValue ?? defaultValue;
        }

        // Cache miss - fetching from DB
        // Use GetAll() for IQueryable to filter by key
        var setting = await _repo.GetAll()
            .FirstOrDefaultAsync(s => s.Key == key);

        var value = setting?.Value ?? defaultValue;

        // Cache for 24 hours or until updated
        _cache.Set(cacheKey, value, TimeSpan.FromHours(24));
        
        return value;
    }

    public async Task<int> GetIntAsync(string key, int defaultValue = 0)
    {
        var value = await GetAsync(key);
        if (int.TryParse(value, out int result))
        {
            return result;
        }
        return defaultValue;
    }

    public async Task<bool> GetBoolAsync(string key, bool defaultValue = false)
    {
         var value = await GetAsync(key);
         if (bool.TryParse(value, out bool result))
         {
             return result;
         }
         return defaultValue;
    }

    public async Task SetAsync(string key, string value, string group = "General", string type = "string", string? description = null)
    {
        var setting = await _repo.GetAll().FirstOrDefaultAsync(s => s.Key == key);

        if (setting == null)
        {
            setting = new SystemSetting
            {
                Key = key,
                Value = value,
                Group = group,
                Type = type,
                Description = description,
                UpdatedAt = DateTime.UtcNow
            };
            await _repo.AddAsync(setting);
        }
        else
        {
            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;
            if (group != "General") setting.Group = group; // Update group if provided and not default
            if (description != null) setting.Description = description;
            
            // Note: Update method in GenericRepo often needs explicit call if tracking is issue, but EF usually tracks loaded entities.
            // If GenericRepo has explicit Update, using it is safer.
            _repo.Update(setting);
        }

        await _repo.SaveChangesAsync();

        // Invalidate Cache
        _cache.Remove($"{CACHE_KEY_PREFIX}{key}");
        _cache.Remove(ALL_SETTINGS_CACHE_KEY);
    }

    public async Task<List<SystemSetting>> GetAllSettingsAsync()
    {
        if (_cache.TryGetValue(ALL_SETTINGS_CACHE_KEY, out List<SystemSetting>? cachedSettings))
        {
            return cachedSettings ?? new List<SystemSetting>();
        }

        var settings = await _repo.GetAllAsync();
        
        _cache.Set(ALL_SETTINGS_CACHE_KEY, settings, TimeSpan.FromHours(24));
        
        return settings;
    }

    public async Task UpdateSettingsAsync(List<SystemSetting> settings)
    {
        foreach (var item in settings)
        {
            // We assume mostly updates
             var existing = await _repo.GetAll().FirstOrDefaultAsync(s => s.Key == item.Key);
             if (existing != null)
             {
                 existing.Value = item.Value;
                 existing.UpdatedAt = DateTime.UtcNow;
                 // Don't update immutable fields like Key/Type unless necessary logic exists
             }
             else
             {
                 // Create new if not exist
                 item.UpdatedAt = DateTime.UtcNow;
                 await _repo.AddAsync(item);
             }
             
             // Invalidate individual keys
             _cache.Remove($"{CACHE_KEY_PREFIX}{item.Key}");
        }

        await _repo.SaveChangesAsync();
        _cache.Remove(ALL_SETTINGS_CACHE_KEY);
    }

    public void ClearCache()
    {
        // Check if IMemoryCache implementation supports clearing everything (usually it doesn't easily without reflection or compaction)
        // But we only care about our keys. Since we can't iterate keys easily in standard IMemoryCache, 
        // we rely on specific key removal.
        // For "Clear All", we primarily need to clear the main list.
        _cache.Remove(ALL_SETTINGS_CACHE_KEY);
    }
}
