FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:99

# Cài đặt OpenJDK Java, Xvfb, xdotool, ImageMagick và curl
RUN apt-get update && apt-get install -y \
    openjdk-11-jre-headless \
    xvfb \
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

COPY . .

RUN chmod +x entrypoint.sh && mkdir -p /app/storage /app/games

# Cổng 7860 là cổng mặc định chuẩn của Hugging Face Spaces
EXPOSE 7860

ENTRYPOINT ["./entrypoint.sh"]
