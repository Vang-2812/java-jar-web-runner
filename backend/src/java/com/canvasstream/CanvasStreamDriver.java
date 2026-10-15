package com.canvasstream;

import java.io.*;
import java.net.*;
import java.util.*;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import org.microemu.MIDletBridge;
import org.microemu.MIDletAccess;
import org.microemu.DisplayAccess;

public class CanvasStreamDriver {
    public static final int OP_FILL_RECT = 1;
    public static final int OP_DRAW_RECT = 2;
    public static final int OP_FILL_ROUND = 3;
    public static final int OP_DRAW_ROUND = 4;
    public static final int OP_LINE = 5;
    public static final int OP_REGION = 6;
    public static final int OP_CLIP = 7;
    public static final int OP_CLIP_RECT = 8;
    public static final int OP_COLOR = 12;
    public static final int OP_IMAGE = 13;
    public static final int OP_FILL_ARC = 15;
    public static final int OP_DRAW_ARC = 16;
    public static final int OP_TRANSLATE = 17;
    public static final int OP_TRIANGLE = 18;

    private static Socket socket;
    private static DataOutputStream dos;
    private static DataInputStream dis;
    private static final Object lock = new Object();
    private static boolean running = true;
    private static final Set<Integer> sentImages = Collections.synchronizedSet(new HashSet<>());
    private static final ByteArrayOutputStream frameBuffer = new ByteArrayOutputStream(16384);

    public static void start() {
        Thread clientThread = new Thread(CanvasStreamDriver::runClient, "CanvasStreamClient-Thread");
        clientThread.setDaemon(true);
        clientThread.start();

        Thread flusherThread = new Thread(() -> {
            while (running) {
                try {
                    Thread.sleep(16); // 60 FPS tick
                    flushFrame(240, 320, 0, 0, 240, 320);
                } catch (Exception ignored) {}
            }
        }, "CanvasStreamFlusher-Thread");
        flusherThread.setDaemon(true);
        flusherThread.start();
    }

    private static void runClient() {
        while (running) {
            try {
                System.out.println("[CanvasStream] Connecting to Node.js on port 9091...");
                socket = new Socket("127.0.0.1", 9091);
                socket.setTcpNoDelay(true);
                dos = new DataOutputStream(new BufferedOutputStream(socket.getOutputStream(), 32768));
                dis = new DataInputStream(new BufferedInputStream(socket.getInputStream()));
                System.out.println("[CanvasStream] Connected to Node.js stream server!");

                // Loop receiving key and pointer events from Node.js
                while (running && !socket.isClosed()) {
                    byte type = dis.readByte();
                    if (type == 1) { // KEY EVENT
                        int code = dis.readInt();
                        boolean pressed = dis.readBoolean();
                        dispatchKey(code, pressed);
                    } else if (type == 2) { // POINTER EVENT
                        short x = dis.readShort();
                        short y = dis.readShort();
                        byte pType = dis.readByte(); // 0: press, 1: release, 2: drag
                        dispatchPointer(x, y, pType);
                    }
                }
            } catch (Exception e) {
                try {
                    if (socket != null) socket.close();
                } catch (Exception ignored) {}
                // Wait 2 seconds before retrying connection
                try { Thread.sleep(2000); } catch (InterruptedException ignored) {}
            }
        }
    }

    private static void dispatchKey(int keyCode, boolean pressed) {
        try {
            MIDletAccess ma = MIDletBridge.getMIDletAccess();
            if (ma != null) {
                DisplayAccess da = ma.getDisplayAccess();
                if (da != null) {
                    if (pressed) {
                        da.keyPressed(keyCode);
                    } else {
                        da.keyReleased(keyCode);
                    }
                }
            }
        } catch (Throwable t) {
            System.err.println("[CanvasStream] Error dispatching key: " + t.getMessage());
        }
    }

    private static void dispatchPointer(short x, short y, byte type) {
        try {
            MIDletAccess ma = MIDletBridge.getMIDletAccess();
            if (ma != null && ma.getDisplayAccess() != null) {
                DisplayAccess da = ma.getDisplayAccess();
                if (type == 0) da.pointerPressed(x, y);
                else if (type == 1) da.pointerReleased(x, y);
                else if (type == 2) da.pointerDragged(x, y);
            }
        } catch (Throwable t) {
            System.err.println("[CanvasStream] Error dispatching pointer: " + t.getMessage());
        }
    }

    // Zigzag VarInt encoder
    public static void writeVarInt(OutputStream out, int val) throws IOException {
        int z = (val << 1) ^ (val >> 31);
        while ((z & ~0x7f) != 0) {
            out.write((z & 0x7f) | 0x80);
            z >>>= 7;
        }
        out.write(z & 0x7f);
    }

    // Send sprite image definition (DEF Type 5)
    public static void sendImageDef(int id, int width, int height, BufferedImage img) {
        if (dos == null || sentImages.contains(id)) return;
        synchronized (lock) {
            if (sentImages.contains(id)) return;
            try {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(img, "png", baos);
                byte[] pngBytes = baos.toByteArray();

                dos.writeByte(5); // DEF Type
                dos.writeInt(id);
                dos.writeShort(width);
                dos.writeShort(height);
                dos.writeInt(pngBytes.length);
                dos.write(pngBytes);
                dos.flush();

                sentImages.add(id);
            } catch (Exception e) {
                // ignore write error
            }
        }
    }

    // Append drawing command to temporary frame buffer
    public static void appendCommand(byte[] cmdData) {
        synchronized (frameBuffer) {
            frameBuffer.write(cmdData, 0, cmdData.length);
        }
    }

    // Flush completed frame to Node.js (CMD Type 3)
    public static void flushFrame(int w, int h, int clipX, int clipY, int clipW, int clipH) {
        if (dos == null) return;
        synchronized (lock) {
            try {
                byte[] cmds;
                synchronized (frameBuffer) {
                    if (frameBuffer.size() == 0) return;
                    cmds = frameBuffer.toByteArray();
                    frameBuffer.reset();
                }

                dos.writeByte(3); // CMD Type
                dos.writeShort(w);
                dos.writeShort(h);
                dos.writeShort(clipX);
                dos.writeShort(clipY);
                dos.writeShort(clipW);
                dos.writeShort(clipH);
                dos.writeInt(cmds.length);
                dos.write(cmds);
                dos.flush();
            } catch (Exception e) {
                // socket disconnected
            }
        }
    }
}
