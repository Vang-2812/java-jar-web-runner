FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:99

# Cài đặt OpenJDK Java, Xvfb, Openbox (Window Manager), xdotool, ImageMagick và curl
RUN apt-get update && apt-get install -y \
    openjdk-11-jre \
    xvfb \
    openbox \
    xdotool \
    imagemagick \
    curl \
    unzip \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Tải J2ME MicroEmulator runner và thư viện Nokia UI
RUN mkdir -p /app/lib && \
    curl -fsSL https://repo1.maven.org/maven2/org/microemu/microemulator/2.0.4/microemulator-2.0.4.jar -o /app/lib/microemulator.jar && \
    curl -fsSL https://repo1.maven.org/maven2/org/microemu/microemu-nokiaui/2.0.4/microemu-nokiaui-2.0.4.jar -o /app/lib/microemu-nokiaui.jar

COPY . .

RUN chmod +x entrypoint.sh && mkdir -p /app/storage /app/games /app/lib

EXPOSE 7860
EXPOSE 10000

ENTRYPOINT ["./entrypoint.sh"]
