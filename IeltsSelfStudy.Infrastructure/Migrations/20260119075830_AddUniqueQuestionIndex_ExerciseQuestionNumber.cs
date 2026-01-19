using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IeltsSelfStudy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueQuestionIndex_ExerciseQuestionNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_ExerciseSection_SectionId",
                table: "Questions");

            migrationBuilder.DropTable(
                name: "ExerciseSection");

            migrationBuilder.DropIndex(
                name: "IX_Questions_ExerciseId_QuestionNumber",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_SectionId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "SectionId",
                table: "Questions");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_ExerciseId_QuestionNumber",
                table: "Questions",
                columns: new[] { "ExerciseId", "QuestionNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Questions_ExerciseId_QuestionNumber",
                table: "Questions");

            migrationBuilder.AddColumn<int>(
                name: "SectionId",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ExerciseSection",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExerciseId = table.Column<int>(type: "int", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationSeconds = table.Column<int>(type: "int", nullable: true),
                    Instructions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    PassageText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuestionCount = table.Column<int>(type: "int", nullable: false),
                    SampleAnswer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transcript = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseSection", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExerciseSection_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_ExerciseId_QuestionNumber",
                table: "Questions",
                columns: new[] { "ExerciseId", "QuestionNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_SectionId",
                table: "Questions",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseSection_ExerciseId",
                table: "ExerciseSection",
                column: "ExerciseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_ExerciseSection_SectionId",
                table: "Questions",
                column: "SectionId",
                principalTable: "ExerciseSection",
                principalColumn: "Id");
        }
    }
}
