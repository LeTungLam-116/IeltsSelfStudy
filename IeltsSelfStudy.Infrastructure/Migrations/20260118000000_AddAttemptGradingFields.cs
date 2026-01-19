using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IeltsSelfStudy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttemptGradingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminFeedback",
                table: "Attempts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GradedBy",
                table: "Attempts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "GradedAt",
                table: "Attempts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPassed",
                table: "Attempts",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GradingNotes",
                table: "Attempts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Attempts",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminFeedback",
                table: "Attempts");

            migrationBuilder.DropColumn(
                name: "GradedBy",
                table: "Attempts");

            migrationBuilder.DropColumn(
                name: "GradedAt",
                table: "Attempts");

            migrationBuilder.DropColumn(
                name: "IsPassed",
                table: "Attempts");

            migrationBuilder.DropColumn(
                name: "GradingNotes",
                table: "Attempts");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Attempts");
        }
    }
}
