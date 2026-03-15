using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IeltsSelfStudy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLevelHistoryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiFeedbackJson",
                table: "UserLevels",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AnswersJson",
                table: "UserLevels",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PlacementTestId",
                table: "UserLevels",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpeakingAudioUrl",
                table: "UserLevels",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WritingEssay",
                table: "UserLevels",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "PlacementTests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_UserLevels_PlacementTestId",
                table: "UserLevels",
                column: "PlacementTestId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserLevels_PlacementTests_PlacementTestId",
                table: "UserLevels",
                column: "PlacementTestId",
                principalTable: "PlacementTests",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserLevels_PlacementTests_PlacementTestId",
                table: "UserLevels");

            migrationBuilder.DropIndex(
                name: "IX_UserLevels_PlacementTestId",
                table: "UserLevels");

            migrationBuilder.DropColumn(
                name: "AiFeedbackJson",
                table: "UserLevels");

            migrationBuilder.DropColumn(
                name: "AnswersJson",
                table: "UserLevels");

            migrationBuilder.DropColumn(
                name: "PlacementTestId",
                table: "UserLevels");

            migrationBuilder.DropColumn(
                name: "SpeakingAudioUrl",
                table: "UserLevels");

            migrationBuilder.DropColumn(
                name: "WritingEssay",
                table: "UserLevels");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "PlacementTests");
        }
    }
}
