FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:99

# Cài đặt OpenJDK Java (đầy đủ hỗ trợ GUI cho Xvfb), Xvfb, xdotool, ImageMagick và curl
RUN apt-get update && apt-get install -y \
    openjdk-11-jre \
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

# Tải J2ME MicroEmulator runner nếu chưa có
RUN mkdir -p /app/lib && \
    curl -fsSL https://repo1.maven.org/maven2/org/microemu/microemulator/2.0.4/microemulator-2.0.4.jar -o /app/lib/microemulator.jar

COPY . .

RUN chmod +x entrypoint.sh && mkdir -p /app/storage /app/games /app/lib

# Cổng 7860 là cổng mặc định chuẩn của Hugging Face Spaces
EXPOSE 7860

ENTRYPOINT ["./entrypoint.sh"]
