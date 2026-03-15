using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Interfaces;

public interface ISettingService
{
    Task<string> GetAsync(string key, string defaultValue = "");
    Task<int> GetIntAsync(string key, int defaultValue = 0);
    Task<bool> GetBoolAsync(string key, bool defaultValue = false);
    
    Task SetAsync(string key, string value, string group = "General", string type = "string", string? description = null);
    
    Task<List<SystemSetting>> GetAllSettingsAsync();
    Task UpdateSettingsAsync(List<SystemSetting> settings);
    
    // Helper to clear cache if needed manually
    void ClearCache();
}
