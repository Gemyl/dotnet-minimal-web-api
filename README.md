# .NET Minimal Web API

An ASP.NET Core 8 minimal API for managing products and categories, with ASP.NET Core Identity authentication, PostgreSQL persistence, and Redis caching. The repository also contains an Angular frontend in `angular-dashboard/`.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with the Docker Compose plugin, for the recommended setup
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0), if running the API directly on your machine
- [Node.js and npm](https://nodejs.org/), if running the Angular frontend

## Run with Docker Compose

Compose starts the API, PostgreSQL, and Redis. The compose file expects the PostgreSQL variables below. Create a `.env` file in the repository root:

```dotenv
POSTGRES_DB=dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mypassword
```

Then start the services:

```bash
docker compose up --build
```

The API listens on [http://localhost:5000](http://localhost:5000). Compose mounts the source directory into the container and runs `dotnet watch`, so API code changes restart the development server. Stop the services with `Ctrl+C`; use `docker compose down` to remove the containers. PostgreSQL and Redis data are stored in named volumes and are retained by `docker compose down`.

The development connection strings are in `appsettings.Development.json`: PostgreSQL at `postgres:5432` and Redis at `redis:6379`. The API uses these hostnames inside Compose. If you change the PostgreSQL credentials in `.env`, update the development `DefaultConnection` connection string to match.

## Run the API directly

Running the API outside Compose still requires PostgreSQL and Redis. Start compatible instances locally, then configure connection strings using .NET configuration environment variables:

```bash
ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=dev;Username=postgres;Password=mypassword' \
ConnectionStrings__Redis='localhost:6379' \
dotnet run --project my-dotnet-api.csproj
```

The checked-in `Properties/launchSettings.json` uses the Development environment and serves HTTP at `http://localhost:5000`. If you run with another environment, set its connection strings as well; `appsettings.json` contains a SQLite connection string, while the application currently configures the PostgreSQL EF Core provider.

To restore and build the API separately:

```bash
dotnet restore my-dotnet-api.csproj
dotnet build my-dotnet-api.csproj
```

## Run the Angular frontend

In another terminal:

```bash
cd angular-dashboard
npm ci
npm start
```

Angular CLI serves the frontend at [http://localhost:4200](http://localhost:4200). Its development environment points to the API at `http://localhost:5000`. The API's CORS policy currently allows that origin.

## API routes

All product and category routes require authentication. The Identity API routes are mapped under `/auth`.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Register using the built-in Identity API |
| POST | `/auth/login` | Sign in using the built-in Identity API |
| POST | `/auth/register-user` | Register with the app's custom user profile fields |
| POST | `/auth/logout` | Clear the refresh-token cookie |
| GET | `/api/products/` | List products |
| GET | `/api/products/{id}` | Get a product by GUID |
| POST | `/api/products/` | Create a product |
| PUT | `/api/products/` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |
| GET | `/api/categories/` | List categories |
| GET | `/api/categories/{id}` | Get a category by GUID |
| POST | `/api/categories/` | Create a category |
| PUT | `/api/categories/` | Update a category |
| DELETE | `/api/categories/{id}` | Delete a category |

Swagger services are registered, but the current startup code does not enable Swagger middleware or map an OpenAPI document, so there is no Swagger UI route at present.

## Configuration and data

- `appsettings.json` contains base logging and connection settings.
- `appsettings.Development.json` configures PostgreSQL and Redis for the Compose service names.
- Environment variables can override settings. For example, `ConnectionStrings__Redis` sets `ConnectionStrings:Redis`.
- PostgreSQL persists in the `postgres_data` Compose volume; Redis persists in `redis_data`.

There is no test project in the repository root. The Angular project has a test script (`npm test`) if you want to run its frontend tests.
