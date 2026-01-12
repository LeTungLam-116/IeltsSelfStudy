using IeltsSelfStudy.Application.DTOs.Auth;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) { _auth = auth; }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var res = await _auth.RegisterAsync(req);
        return Ok(res);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var res = await _auth.LoginAsync(req);
        return Ok(res);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
    {
        var res = await _auth.RefreshAsync(req);
        return Ok(res);
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke([FromBody] RefreshRequest req)
    {
        await _auth.RevokeRefreshTokenAsync(req.RefreshToken);
        return NoContent();
    }
}