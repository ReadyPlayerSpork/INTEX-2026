namespace Haven_for_Her_Backend.Data
{
    public class AuthRoles
    {
        public const string Admin = "Admin";
        public const string Financial = "Financial";
        public const string Counselor = "Counselor";
        public const string SocialMedia = "SocialMedia";
        public const string Employee = "Employee";
        public const string Donor = "Donor";
        public const string Survivor = "Survivor";

        public static readonly string[] All =
        [
            Admin,
            Financial,
            Counselor,
            SocialMedia,
            Employee,
            Donor,
            Survivor
        ];
    }
}
