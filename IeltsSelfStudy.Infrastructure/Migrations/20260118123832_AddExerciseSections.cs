using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IeltsSelfStudy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseSections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SectionId",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MinWordCount",
                table: "Exercises",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "ExerciseSection",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExerciseId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Transcript = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationSeconds = table.Column<int>(type: "int", nullable: true),
                    PassageText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Instructions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SampleAnswer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuestionCount = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_ExerciseSection_SectionId",
                table: "Questions");

            migrationBuilder.DropTable(
                name: "ExerciseSection");

            migrationBuilder.DropIndex(
                name: "IX_Questions_SectionId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "SectionId",
                table: "Questions");

            migrationBuilder.AlterColumn<int>(
                name: "MinWordCount",
                table: "Exercises",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
