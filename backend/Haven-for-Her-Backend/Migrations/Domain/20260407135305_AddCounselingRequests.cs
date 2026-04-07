using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Haven_for_Her_Backend.Migrations.Domain
{
    /// <inheritdoc />
    public partial class AddCounselingRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "counseling_requests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    requested_by_user_id = table.Column<string>(type: "TEXT", nullable: false),
                    reason = table.Column<string>(type: "TEXT", nullable: false),
                    preferred_day = table.Column<string>(type: "TEXT", nullable: true),
                    preferred_time_of_day = table.Column<string>(type: "TEXT", nullable: true),
                    notes = table.Column<string>(type: "TEXT", nullable: true),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    assigned_counselor_user_id = table.Column<string>(type: "TEXT", nullable: true),
                    created_at_utc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counseling_requests", x => x.request_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "counseling_requests");
        }
    }
}
