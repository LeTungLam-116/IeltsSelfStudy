namespace IeltsSelfStudy.Application.Interfaces;

public interface IVnPayTool
{
    void AddRequestData(string key, string value);
    void AddResponseData(string key, string value);
    string GetResponseData(string key);
    string CreateRequestUrl(string baseUrl, string vnp_HashSecret);
    bool ValidateSignature(string inputHash, string vnp_HashSecret);
    void ClearRequestData(); // Helper method if needed to reuse instance
}
