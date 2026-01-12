using IeltsSelfStudy.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IeltsSelfStudy.Infrastructure.Persistence;

public class IeltsDbContext : DbContext
{
    public IeltsDbContext(DbContextOptions<IeltsDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<ListeningExercise> ListeningExercises => Set<ListeningExercise>();
    public DbSet<ReadingExercise> ReadingExercises => Set<ReadingExercise>();
    public DbSet<Attempt> Attempts => Set<Attempt>();
    public DbSet<WritingExercise> WritingExercises => Set<WritingExercise>();
    public DbSet<SpeakingExercise> SpeakingExercises => Set<SpeakingExercise>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<CourseExercise> CourseExercises => Set<CourseExercise>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User config by Fluent API
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Id).ValueGeneratedOnAdd();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(255);
            entity.Property(u => u.Role).IsRequired().HasMaxLength(50);
            entity.Property(u => u.TargetBand).HasColumnType("float");
            entity.Property(u => u.CreatedAt).IsRequired();
            entity.Property(u => u.IsActive).IsRequired();
        });

        // Course config by Fluent API
        modelBuilder.Entity<Course>(entity =>
        {
            entity.ToTable("Courses");

            entity.HasKey(c => c.Id);

            entity.Property(c => c.Id)
                  .ValueGeneratedOnAdd();

            entity.Property(c => c.Name)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(c => c.ShortDescription)
                  .HasMaxLength(500);

            entity.Property(c => c.Level)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(c => c.Skill)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(c => c.TargetBand)
                  .HasColumnType("float");

            entity.Property(c => c.Price)
                  .HasColumnType("decimal(18,2)");

            entity.Property(c => c.IsActive)
                  .IsRequired();

            entity.Property(c => c.CreatedAt)
                  .IsRequired();
        });

        // CourseExercise config by Fluent API
        modelBuilder.Entity<CourseExercise>(entity =>
        {
            entity.ToTable("CourseExercises");

            entity.HasKey(ce => ce.Id);

            entity.Property(ce => ce.Id)
                  .ValueGeneratedOnAdd();

            entity.Property(ce => ce.CourseId)
                  .IsRequired();

            entity.Property(ce => ce.Skill)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(ce => ce.ExerciseId)
                  .IsRequired();

            entity.Property(ce => ce.Order)
                  .IsRequired();

            entity.Property(ce => ce.CreatedAt)
                  .IsRequired();

            // Foreign key relationship
            entity.HasOne(ce => ce.Course)
                  .WithMany()
                  .HasForeignKey(ce => ce.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Index để query nhanh hơn
            entity.HasIndex(ce => new { ce.CourseId, ce.Order });
            entity.HasIndex(ce => new { ce.CourseId, ce.Skill, ce.ExerciseId });
        });

        // ListeningExercise config by Fluent API
        modelBuilder.Entity<ListeningExercise>(entity =>
        {
            entity.ToTable("ListeningExercises");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                  .ValueGeneratedOnAdd();

            entity.Property(e => e.Title)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(e => e.Description)
                  .HasMaxLength(500);

            entity.Property(e => e.AudioUrl)
                  .IsRequired()
                  .HasMaxLength(500);

            entity.Property(e => e.Level)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(e => e.QuestionCount)
                  .IsRequired();

            entity.Property(e => e.DurationSeconds);

            entity.Property(e => e.IsActive)
                  .IsRequired();

            entity.Property(e => e.CreatedAt)
                  .IsRequired();
        });

        // ReadingExercise config by Fluent API
        modelBuilder.Entity<ReadingExercise>(entity =>
        {
            entity.ToTable("ReadingExercises");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                  .ValueGeneratedOnAdd();

            entity.Property(e => e.Title)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(e => e.Description)
                  .HasMaxLength(500);

            entity.Property(e => e.PassageText)
                  .IsRequired();

            entity.Property(e => e.Level)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(e => e.QuestionCount)
                  .IsRequired();

            entity.Property(e => e.IsActive)
                  .IsRequired();

            entity.Property(e => e.CreatedAt)
                  .IsRequired();
        });

        modelBuilder.Entity<Attempt>(entity =>
        {
            entity.ToTable("Attempts");

            entity.HasKey(a => a.Id);

            entity.Property(a => a.Id)
                  .ValueGeneratedOnAdd();

            entity.Property(a => a.UserId)
                  .IsRequired();

            entity.Property(a => a.Skill)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(a => a.ExerciseId)
                  .IsRequired();

            entity.Property(a => a.Score)
                  .HasColumnType("float");

            entity.Property(a => a.MaxScore)
                  .HasColumnType("float");

            entity.Property(a => a.UserAnswerJson)
                  .HasColumnType("nvarchar(max)"); // Thêm dòng này

            entity.Property(a => a.AiFeedback)
                  .HasColumnType("nvarchar(max)"); // Thêm dòng này - QUAN TRỌNG!

            entity.Property(a => a.IsActive)
                  .IsRequired();

            entity.Property(a => a.CreatedAt)
                  .IsRequired();
        });

        // WritingExercise config by Fluent API
        modelBuilder.Entity<WritingExercise>(entity =>
        {
            entity.ToTable("WritingExercises");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                  .ValueGeneratedOnAdd();

            entity.Property(e => e.Title)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(e => e.Description)
                  .HasMaxLength(500);

            entity.Property(e => e.TaskType)
                  .IsRequired()
                  .HasMaxLength(20);

            entity.Property(e => e.Question)
                  .IsRequired();

            entity.Property(e => e.Topic)
                  .HasMaxLength(100);

            entity.Property(e => e.Level)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(e => e.MinWordCount)
                  .IsRequired();

            entity.Property(e => e.SampleAnswer);

            entity.Property(e => e.IsActive)
                  .IsRequired();

            entity.Property(e => e.CreatedAt)
                  .IsRequired();
        });

        // SpeakingExercise config by Fluent API
        modelBuilder.Entity<SpeakingExercise>(entity =>
        {
            entity.ToTable("SpeakingExercises");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.Property(e => e.Part).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Question).IsRequired();

            entity.Property(e => e.Topic).HasMaxLength(100);

            entity.Property(e => e.Level).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Tips);

            entity.Property(e => e.IsActive).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // Question config by Fluent API
        modelBuilder.Entity<Question>(entity =>
        {
            entity.ToTable("Questions");

            entity.HasKey(q => q.Id);

            entity.Property(q => q.Id)
                  .ValueGeneratedOnAdd();

            entity.Property(q => q.Skill)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(q => q.ExerciseId)
                  .IsRequired();

            entity.Property(q => q.QuestionNumber)
                  .IsRequired();

            entity.Property(q => q.QuestionText)
                  .IsRequired();

            entity.Property(q => q.QuestionType)
                  .IsRequired()
                  .HasMaxLength(50)
                  .HasDefaultValue("MultipleChoice");

            entity.Property(q => q.CorrectAnswer)
                  .IsRequired()
                  .HasMaxLength(500);

            entity.Property(q => q.Points)
                  .IsRequired()
                  .HasColumnType("float")
                  .HasDefaultValue(1.0);

            entity.Property(q => q.OptionsJson)
                  .HasColumnType("nvarchar(max)");

            entity.Property(q => q.IsActive)
                  .IsRequired()
                  .HasDefaultValue(true);

            entity.Property(q => q.CreatedAt)
                  .IsRequired();

            // Index để query nhanh hơn
            entity.HasIndex(q => new { q.Skill, q.ExerciseId });
            entity.HasIndex(q => new { q.ExerciseId, q.QuestionNumber });
        });

        // RefreshToken config by Fluent API
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.HasKey(r => r.Id);
            entity.Property(r => r.TokenHash).IsRequired().HasMaxLength(200);
            entity.Property(r => r.ExpiresAt).IsRequired();
            entity.Property(r => r.CreatedAt).IsRequired();
            entity.Property(r => r.RevokedAt);
            entity.Property(r => r.ReplacedByTokenHash).HasMaxLength(200);
            entity.HasIndex(r => new { r.UserId, r.TokenHash }).IsUnique();
        });

    }
}
