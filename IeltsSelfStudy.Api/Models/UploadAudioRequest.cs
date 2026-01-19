using Microsoft.AspNetCore.Http;

namespace IeltsSelfStudy.Api.Models
{
    public class UploadAudioRequest
    {
        public IFormFile File { get; set; } = null!;
    }
}


