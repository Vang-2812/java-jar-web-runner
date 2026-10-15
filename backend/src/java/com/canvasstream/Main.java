package com.canvasstream;

public class Main {
    public static void main(String[] args) {
        System.out.println("[CanvasStream] Starting 60 FPS Canvas Command Streaming Driver...");
        CanvasStreamDriver.start();
        org.microemu.app.Main.main(args);
    }
}
