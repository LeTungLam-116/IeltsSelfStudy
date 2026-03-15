using IeltsSelfStudy.Application.DTOs.Placement;
using IeltsSelfStudy.Domain.Entities;
using System.IO;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IPlacementTestService
{
    Task<PlacementTest?> GetDefaultTestAsync();
    Task<PlacementTestResultDto> SubmitTestAsync(int userId, PlacementTestSubmitRequest request, Stream? audioStream = null, string? audioFileName = null);
    Task<UserLevel?> GetUserLevelAsync(int userId);

    // History
    Task<List<PlacementTestHistoryDto>> GetHistoryAsync(int userId);
    Task<PlacementTestResultDetailDto?> GetResultDetailAsync(int id, int userId);

    // CRUD
    Task<List<PlacementTestListDto>> GetAllTestsAsync();
    Task<PlacementTestDetailDto?> GetTestByIdAsync(int id);
    Task<PlacementTestDetailDto> CreateTestAsync(CreatePlacementTestRequest request);
    Task<PlacementTestDetailDto?> UpdateTestAsync(int id, UpdatePlacementTestRequest request);
    Task<bool> DeleteTestAsync(int id);
    Task<bool> SetActiveTestAsync(int id);
}
