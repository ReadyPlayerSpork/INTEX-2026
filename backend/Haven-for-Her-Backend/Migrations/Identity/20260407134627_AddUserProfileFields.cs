using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Haven_for_Her_Backend.Migrations.Identity
{
    /// <inheritdoc />
    public partial class AddUserProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AcquisitionDetail",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AcquisitionSource",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Persona",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcquisitionDetail",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "AcquisitionSource",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Persona",
                table: "AspNetUsers");
        }
    }
}
