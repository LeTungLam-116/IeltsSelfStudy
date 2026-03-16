FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the solution file and project files
COPY *.sln .
COPY IeltsSelfStudy.Domain/*.csproj ./IeltsSelfStudy.Domain/
COPY IeltsSelfStudy.Application/*.csproj ./IeltsSelfStudy.Application/
COPY IeltsSelfStudy.Infrastructure/*.csproj ./IeltsSelfStudy.Infrastructure/
COPY IeltsSelfStudy.Api/*.csproj ./IeltsSelfStudy.Api/

# Restore dependencies
RUN dotnet restore

# Copy all the source code
COPY . .

# Build and publish the application
WORKDIR /app/IeltsSelfStudy.Api
RUN dotnet publish -c Release -o /out

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

# Expose port (Render automatically uses 80 or PORT env variable)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "IeltsSelfStudy.Api.dll"]
