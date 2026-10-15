FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:99

# Cài đặt OpenJDK 11 JDK (kèm javac & jar), Xvfb, Openbox, xdotool, ImageMagick và curl
RUN apt-get update && apt-get install -y \
    openjdk-11-jdk-headless \
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

# Biên dịch CanvasStream Driver & J2SEDisplayGraphics hook thành canvasstream.jar
RUN mkdir -p /app/build && \
    javac -cp /app/lib/microemulator.jar -d /app/build /app/src/java/com/canvasstream/*.java /app/src/java/org/microemu/device/j2se/*.java && \
    jar cf /app/lib/canvasstream.jar -C /app/build . && \
    rm -rf /app/build

RUN chmod +x entrypoint.sh && mkdir -p /app/storage /app/games /app/lib

EXPOSE 7860
EXPOSE 10000

ENTRYPOINT ["./entrypoint.sh"]
