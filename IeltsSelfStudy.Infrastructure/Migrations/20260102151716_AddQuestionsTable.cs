using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IeltsSelfStudy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Skill = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ExerciseId = table.Column<int>(type: "int", nullable: false),
                    QuestionNumber = table.Column<int>(type: "int", nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuestionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "MultipleChoice"),
                    CorrectAnswer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Points = table.Column<double>(type: "float", nullable: false, defaultValue: 1.0),
                    OptionsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_ExerciseId_QuestionNumber",
                table: "Questions",
                columns: new[] { "ExerciseId", "QuestionNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_Skill_ExerciseId",
                table: "Questions",
                columns: new[] { "Skill", "ExerciseId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Questions");
        }
    }
}
