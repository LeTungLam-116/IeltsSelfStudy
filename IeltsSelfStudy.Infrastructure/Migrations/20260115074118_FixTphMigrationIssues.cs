using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IeltsSelfStudy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixTphMigrationIssues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clean up legacy triggers that reference dropped tables
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS TR_Attempts_ValidateExerciseId");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS TR_Questions_ValidateExerciseId");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS TR_CourseExercises_ValidateExerciseId");

            // Clean up legacy indexes that reference Skill column
            migrationBuilder.Sql("IF EXISTS(SELECT 1 FROM sys.indexes WHERE name='IX_Attempts_Skill_ExerciseId') EXEC('DROP INDEX IX_Attempts_Skill_ExerciseId ON Attempts')");
            migrationBuilder.Sql("IF EXISTS(SELECT 1 FROM sys.indexes WHERE name='IX_Questions_Skill_ExerciseId') EXEC('DROP INDEX IX_Questions_Skill_ExerciseId ON Questions')");
            migrationBuilder.Sql("IF EXISTS(SELECT 1 FROM sys.indexes WHERE name='IX_CourseExercises_Skill_ExerciseId') EXEC('DROP INDEX IX_CourseExercises_Skill_ExerciseId ON CourseExercises')");

            // Drop legacy tables with existence checks
            migrationBuilder.Sql("DROP TABLE IF EXISTS ListeningExercises");
            migrationBuilder.Sql("DROP TABLE IF EXISTS ReadingExercises");
            migrationBuilder.Sql("DROP TABLE IF EXISTS SpeakingExercises");
            migrationBuilder.Sql("DROP TABLE IF EXISTS WritingExercises");

            // Drop ALL indexes that depend on Skill column before dropping the column
            migrationBuilder.Sql(@"
                -- Drop any remaining indexes that reference Skill column in CourseExercises
                DECLARE @sql NVARCHAR(MAX) = '';
                SELECT @sql = @sql + 'DROP INDEX ' + i.name + ' ON ' + OBJECT_NAME(i.object_id) + '; '
                FROM sys.indexes i
                JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
                WHERE c.name = 'Skill' AND OBJECT_NAME(i.object_id) = 'CourseExercises';
                IF @sql <> '' EXEC(@sql);
            ");

            migrationBuilder.Sql(@"
                -- Drop any remaining indexes that reference Skill column in Questions
                DECLARE @sql NVARCHAR(MAX) = '';
                SELECT @sql = @sql + 'DROP INDEX ' + i.name + ' ON ' + OBJECT_NAME(i.object_id) + '; '
                FROM sys.indexes i
                JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
                WHERE c.name = 'Skill' AND OBJECT_NAME(i.object_id) = 'Questions';
                IF @sql <> '' EXEC(@sql);
            ");

            migrationBuilder.Sql(@"
                -- Drop any remaining indexes that reference Skill column in Attempts
                DECLARE @sql NVARCHAR(MAX) = '';
                SELECT @sql = @sql + 'DROP INDEX ' + i.name + ' ON ' + OBJECT_NAME(i.object_id) + '; '
                FROM sys.indexes i
                JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
                WHERE c.name = 'Skill' AND OBJECT_NAME(i.object_id) = 'Attempts';
                IF @sql <> '' EXEC(@sql);
            ");

            // Drop Skill columns with existence checks
            migrationBuilder.Sql(@"
                IF EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Questions') AND name = 'Skill')
                BEGIN
                    ALTER TABLE Questions DROP COLUMN Skill;
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CourseExercises') AND name = 'Skill')
                BEGIN
                    ALTER TABLE CourseExercises DROP COLUMN Skill;
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Attempts') AND name = 'Skill')
                BEGIN
                    ALTER TABLE Attempts DROP COLUMN Skill;
                END
            ");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "QuestionType",
                table: "Questions",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "MultipleChoice",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<double>(
                name: "Points",
                table: "Questions",
                type: "float",
                nullable: false,
                defaultValue: 1.0,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Questions",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.CreateTable(
                name: "Exercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    QuestionCount = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Transcript = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationSeconds = table.Column<int>(type: "int", nullable: true),
                    PassageText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Topic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MinWordCount = table.Column<int>(type: "int", nullable: true),
                    SampleAnswer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Part = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Question = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tips = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exercises", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseExercises_ExerciseId",
                table: "CourseExercises",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_Attempts_ExerciseId",
                table: "Attempts",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_Attempts_UserId",
                table: "Attempts",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attempts_Exercises_ExerciseId",
                table: "Attempts",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // Create FK_Attempts_Users_UserId only if it doesn't already exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Attempts_Users_UserId')
                BEGIN
                    ALTER TABLE [Attempts] ADD CONSTRAINT [FK_Attempts_Users_UserId]
                        FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
                END
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseExercises_Exercises_ExerciseId",
                table: "CourseExercises",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Exercises_ExerciseId",
                table: "Questions",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // Fix discriminator values for TPH
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM Exercises WHERE Type IS NULL OR Type = '')
                BEGIN
                    -- Set default discriminator for existing records
                    UPDATE Exercises SET Type = 'Writing' WHERE Type IS NULL OR Type = '';
                END

                -- Normalize discriminator values to match EF configuration
                UPDATE Exercises SET Type = 'Listening' WHERE LOWER(Type) = 'listening';
                UPDATE Exercises SET Type = 'Reading' WHERE LOWER(Type) = 'reading';
                UPDATE Exercises SET Type = 'Writing' WHERE LOWER(Type) = 'writing';
                UPDATE Exercises SET Type = 'Speaking' WHERE LOWER(Type) = 'speaking';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attempts_Exercises_ExerciseId",
                table: "Attempts");

            migrationBuilder.DropForeignKey(
                name: "FK_Attempts_Users_UserId",
                table: "Attempts");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseExercises_Exercises_ExerciseId",
                table: "CourseExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Exercises_ExerciseId",
                table: "Questions");

            migrationBuilder.DropTable(
                name: "Exercises");

            migrationBuilder.DropIndex(
                name: "IX_CourseExercises_ExerciseId",
                table: "CourseExercises");

            migrationBuilder.DropIndex(
                name: "IX_Attempts_ExerciseId",
                table: "Attempts");

            migrationBuilder.DropIndex(
                name: "IX_Attempts_UserId",
                table: "Attempts");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "nvarchar(max)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "QuestionType",
                table: "Questions",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldDefaultValue: "MultipleChoice");

            migrationBuilder.AlterColumn<double>(
                name: "Points",
                table: "Questions",
                type: "float",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float",
                oldDefaultValue: 1.0);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Questions",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Skill",
                table: "Questions",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Skill",
                table: "CourseExercises",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Skill",
                table: "Attempts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            // Revert discriminator values back to old format for rollback
            migrationBuilder.Sql(@"
                UPDATE Exercises SET Type = LOWER(Type) WHERE Type IN ('Listening', 'Reading', 'Writing', 'Speaking');
            ");

            migrationBuilder.CreateTable(
                name: "ListeningExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AudioUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DurationSeconds = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    QuestionCount = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Transcript = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListeningExercises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReadingExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PassageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuestionCount = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingExercises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SpeakingExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Part = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Question = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tips = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Topic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpeakingExercises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WritingExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MinWordCount = table.Column<int>(type: "int", nullable: false),
                    Question = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SampleAnswer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Topic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingExercises", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_Skill_ExerciseId",
                table: "Questions",
                columns: new[] { "Skill", "ExerciseId" });

            migrationBuilder.CreateIndex(
                name: "IX_CourseExercises_CourseId_Skill_ExerciseId",
                table: "CourseExercises",
                columns: new[] { "CourseId", "Skill", "ExerciseId" });
        }
    }
}
