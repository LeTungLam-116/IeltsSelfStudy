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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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

        // Course config
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

    }
}
