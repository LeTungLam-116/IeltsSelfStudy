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

            entity.Property(a => a.UserAnswerJson);

            entity.Property(a => a.AiFeedback);

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


    }
}
