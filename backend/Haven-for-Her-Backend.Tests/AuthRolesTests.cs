using Haven_for_Her_Backend.Data;

namespace Haven_for_Her_Backend.Tests;

public class AuthRolesTests
{
    [Fact]
    public void All_ContainsExactlySevenRoles()
    {
        Assert.Equal(7, AuthRoles.All.Length);
    }

    [Theory]
    [InlineData(AuthRoles.Admin)]
    [InlineData(AuthRoles.Financial)]
    [InlineData(AuthRoles.Counselor)]
    [InlineData(AuthRoles.SocialMedia)]
    [InlineData(AuthRoles.Employee)]
    [InlineData(AuthRoles.Donor)]
    [InlineData(AuthRoles.Survivor)]
    public void All_ContainsRole(string role)
    {
        Assert.Contains(role, AuthRoles.All);
    }
}
