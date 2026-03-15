using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace IeltsSelfStudy.Infrastructure.Payment;

public class VnPayLibrary : IVnPayTool
{
    private readonly SortedList<string, string> _requestData = new SortedList<string, string>(new VnPayCompare());
    private readonly SortedList<string, string> _responseData = new SortedList<string, string>(new VnPayCompare());

    public void AddRequestData(string key, string value)
    {
        if (!string.IsNullOrEmpty(value))
        {
            _requestData.Add(key, value);
        }
    }

    public void AddResponseData(string key, string value)
    {
        if (!string.IsNullOrEmpty(value))
        {
            _responseData.Add(key, value);
        }
    }

    public string GetResponseData(string key)
    {
        return _responseData.TryGetValue(key, out var retValue) ? retValue : string.Empty;
    }

    public void ClearRequestData()
    {
        _requestData.Clear();
        _responseData.Clear();
    }

    public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
    {
        var data = new StringBuilder();
        foreach (var kv in _requestData)
        {
            if (data.Length > 0)
            {
                data.Append("&");
            }
            data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value));
        }

        var queryString = data.ToString();
        var vnp_SecureHash = HmacSHA512(vnp_HashSecret, queryString);
        baseUrl += "?" + queryString;
        baseUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return baseUrl;
    }

    public bool ValidateSignature(string inputHash, string vnp_HashSecret)
    {
        var data = new StringBuilder();
        foreach (var kv in _responseData)
        {
            if (kv.Key == "vnp_SecureHash" || kv.Key == "vnp_SecureHashType")
                continue;

            if (data.Length > 0)
            {
                data.Append("&");
            }
            data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value));
        }

        var myChecksum = HmacSHA512(vnp_HashSecret, data.ToString());
        return myChecksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
    }

    private static string HmacSHA512(string key, string inputData)
    {
        var hash = new StringBuilder();
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);
        using (var hmac = new HMACSHA512(keyBytes))
        {
            var hashValue = hmac.ComputeHash(inputBytes);
            foreach (var theByte in hashValue)
            {
                hash.Append(theByte.ToString("x2"));
            }
        }

        return hash.ToString();
    }
}

public class VnPayCompare : IComparer<string>
{
    public int Compare(string? x, string? y)
    {
        if (x == y) return 0;
        if (x == null) return -1;
        if (y == null) return 1;
        var vnpCompare = CompareInfo.GetCompareInfo("en-US");
        return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
    }
}
