FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dev
WORKDIR /app

ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:5000"]
