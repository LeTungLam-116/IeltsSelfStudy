using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IeltsSelfStudy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddThumbnailUrlToCourse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "Courses");
        }
    }
}
