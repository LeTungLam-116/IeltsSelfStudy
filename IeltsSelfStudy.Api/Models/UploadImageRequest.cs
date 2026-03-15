using Microsoft.AspNetCore.Http;

namespace IeltsSelfStudy.Api.Models
{
    public class UploadImageRequest
    {
        public IFormFile File { get; set; } = null!;
    }
}
