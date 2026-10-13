FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dev
WORKDIR /app

RUN apt-get update \
    && apt-get install -y curl unzip \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /vsdbg \
    && curl -sSL https://aka.ms/getvsdbgsh \
       | bash /dev/stdin -v latest -l /vsdbg

ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:5000"]
