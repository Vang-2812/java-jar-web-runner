package org.microemu.device.j2se;

import java.awt.Color;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;
import org.microemu.device.MutableImage;
import com.canvasstream.CanvasStreamDriver;

public class J2SEDisplayGraphics extends Graphics {
    private Graphics2D g;
    private MutableImage image;
    private int currentColor = 0x000000;
    private int transX = 0;
    private int transY = 0;
    private int strokeStyle = Graphics.SOLID;
    private Font currentFont = Font.getDefaultFont();

    public J2SEDisplayGraphics(Graphics2D g, MutableImage image) {
        this.g = g;
        this.image = image;
    }

    public MutableImage getImage() {
        return this.image;
    }

    private void writeVar(ByteArrayOutputStream baos, int val) {
        try {
            CanvasStreamDriver.writeVarInt(baos, val);
        } catch (IOException ignored) {}
    }

    @Override
    public void setColor(int RGB) {
        this.currentColor = RGB & 0x00FFFFFF;
        if (g != null) g.setColor(new Color(this.currentColor));

        ByteArrayOutputStream baos = new ByteArrayOutputStream(6);
        baos.write(CanvasStreamDriver.OP_COLOR);
        writeVar(baos, this.currentColor);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void setColor(int red, int green, int blue) {
        setColor(((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF));
    }

    @Override
    public int getColor() {
        return this.currentColor;
    }

    @Override
    public int getRedComponent() {
        return (this.currentColor >> 16) & 0xFF;
    }

    @Override
    public int getGreenComponent() {
        return (this.currentColor >> 8) & 0xFF;
    }

    @Override
    public int getBlueComponent() {
        return this.currentColor & 0xFF;
    }

    @Override
    public void fillRect(int x, int y, int width, int height) {
        if (g != null) g.fillRect(x, y, width, height);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(16);
        baos.write(CanvasStreamDriver.OP_FILL_RECT);
        writeVar(baos, x);
        writeVar(baos, y);
        writeVar(baos, width);
        writeVar(baos, height);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void drawRect(int x, int y, int width, int height) {
        if (g != null) g.drawRect(x, y, width, height);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(16);
        baos.write(CanvasStreamDriver.OP_DRAW_RECT);
        writeVar(baos, x);
        writeVar(baos, y);
        writeVar(baos, width);
        writeVar(baos, height);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void fillRoundRect(int x, int y, int width, int height, int arcWidth, int arcHeight) {
        if (g != null) g.fillRoundRect(x, y, width, height, arcWidth, arcHeight);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(20);
        baos.write(CanvasStreamDriver.OP_FILL_ROUND);
        writeVar(baos, x);
        writeVar(baos, y);
        writeVar(baos, width);
        writeVar(baos, height);
        writeVar(baos, arcWidth);
        writeVar(baos, arcHeight);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void drawRoundRect(int x, int y, int width, int height, int arcWidth, int arcHeight) {
        if (g != null) g.drawRoundRect(x, y, width, height, arcWidth, arcHeight);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(20);
        baos.write(CanvasStreamDriver.OP_DRAW_ROUND);
        writeVar(baos, x);
        writeVar(baos, y);
        writeVar(baos, width);
        writeVar(baos, height);
        writeVar(baos, arcWidth);
        writeVar(baos, arcHeight);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void drawLine(int x1, int y1, int x2, int y2) {
        if (g != null) g.drawLine(x1, y1, x2, y2);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(16);
        baos.write(CanvasStreamDriver.OP_LINE);
        writeVar(baos, x1);
        writeVar(baos, y1);
        writeVar(baos, x2);
        writeVar(baos, x2);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void fillArc(int x, int y, int width, int height, int startAngle, int arcAngle) {
        if (g != null) g.fillArc(x, y, width, height, startAngle, arcAngle);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(20);
        baos.write(CanvasStreamDriver.OP_FILL_ARC);
        writeVar(baos, x);
        writeVar(baos, y);
        writeVar(baos, width);
        writeVar(baos, height);
        writeVar(baos, startAngle);
        writeVar(baos, arcAngle);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void drawArc(int x, int y, int width, int height, int startAngle, int arcAngle) {
        if (g != null) g.drawArc(x, y, width, height, startAngle, arcAngle);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(20);
        baos.write(CanvasStreamDriver.OP_DRAW_ARC);
        writeVar(baos, x);
        writeVar(baos, y);
        writeVar(baos, width);
        writeVar(baos, height);
        writeVar(baos, startAngle);
        writeVar(baos, arcAngle);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void fillTriangle(int x1, int y1, int x2, int y2, int x3, int y3) {
        if (g != null) {
            int[] xs = new int[]{x1, x2, x3};
            int[] ys = new int[]{y1, y2, y3};
            g.fillPolygon(xs, ys, 3);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream(24);
        baos.write(CanvasStreamDriver.OP_TRIANGLE);
        writeVar(baos, x1);
        writeVar(baos, y1);
        writeVar(baos, x2);
        writeVar(baos, y2);
        writeVar(baos, x3);
        writeVar(baos, y3);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    private int ensureImageDef(Image img) {
        if (img == null) return -1;
        int id = System.identityHashCode(img);
        try {
            java.lang.reflect.Method m = img.getClass().getMethod("getBufferedImage");
            BufferedImage bImg = (BufferedImage) m.invoke(img);
            if (bImg != null) {
                CanvasStreamDriver.sendImageDef(id, img.getWidth(), img.getHeight(), bImg);
            }
        } catch (Exception e) {
            try {
                java.lang.reflect.Field f = img.getClass().getDeclaredField("image");
                f.setAccessible(true);
                BufferedImage bImg = (BufferedImage) f.get(img);
                if (bImg != null) {
                    CanvasStreamDriver.sendImageDef(id, img.getWidth(), img.getHeight(), bImg);
                }
            } catch (Exception ignored) {}
        }
        return id;
    }

    @Override
    public void drawImage(Image img, int x, int y, int anchor) {
        if (img == null) return;
        int id = ensureImageDef(img);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(16);
        baos.write(CanvasStreamDriver.OP_IMAGE);
        writeVar(baos, id);
        writeVar(baos, x);
        writeVar(baos, y);
        writeVar(baos, anchor);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void drawRegion(Image src, int x_src, int y_src, int width, int height, int transform, int x_dest, int y_dest, int anchor) {
        if (src == null) return;
        int id = ensureImageDef(src);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(24);
        baos.write(CanvasStreamDriver.OP_REGION);
        writeVar(baos, id);
        writeVar(baos, x_src);
        writeVar(baos, y_src);
        writeVar(baos, width);
        writeVar(baos, height);
        writeVar(baos, transform);
        writeVar(baos, x_dest);
        writeVar(baos, y_dest);
        writeVar(baos, anchor);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void drawRGB(int[] rgbData, int offset, int scanlength, int x, int y, int width, int height, boolean processAlpha) {
        if (g != null && width > 0 && height > 0) {
            BufferedImage bi = new BufferedImage(width, height, processAlpha ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
            bi.setRGB(0, 0, width, height, rgbData, offset, scanlength);
            g.drawImage(bi, x, y, null);
        }
    }

    @Override
    public void translate(int x, int y) {
        this.transX += x;
        this.transY += y;
        if (g != null) g.translate(x, y);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(10);
        baos.write(CanvasStreamDriver.OP_TRANSLATE);
        writeVar(baos, x);
        writeVar(baos, y);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public int getTranslateX() {
        return this.transX;
    }

    @Override
    public int getTranslateY() {
        return this.transY;
    }

    @Override
    public void setClip(int x, int y, int width, int height) {
        if (g != null) g.setClip(x, y, width, height);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(16);
        baos.write(CanvasStreamDriver.OP_CLIP);
        writeVar(baos, x);
        writeVar(baos, y);
        writeVar(baos, width);
        writeVar(baos, height);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public void clipRect(int x, int y, int width, int height) {
        if (g != null) g.clipRect(x, y, width, height);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(16);
        baos.write(CanvasStreamDriver.OP_CLIP_RECT);
        writeVar(baos, x);
        writeVar(baos, y);
        writeVar(baos, width);
        writeVar(baos, height);
        CanvasStreamDriver.appendCommand(baos.toByteArray());
    }

    @Override
    public int getClipX() {
        if (g != null && g.getClipBounds() != null) return g.getClipBounds().x;
        return 0;
    }

    @Override
    public int getClipY() {
        if (g != null && g.getClipBounds() != null) return g.getClipBounds().y;
        return 0;
    }

    @Override
    public int getClipWidth() {
        if (g != null && g.getClipBounds() != null) return g.getClipBounds().width;
        return (this.image != null) ? this.image.getWidth() : 240;
    }

    @Override
    public int getClipHeight() {
        if (g != null && g.getClipBounds() != null) return g.getClipBounds().height;
        return (this.image != null) ? this.image.getHeight() : 320;
    }

    @Override
    public void drawString(String str, int x, int y, int anchor) {
        if (str == null) return;
        if (g != null) {
            g.drawString(str, x, y);
        }
    }

    @Override
    public void drawSubstring(String str, int offset, int len, int x, int y, int anchor) {
        if (str == null) return;
        drawString(str.substring(offset, offset + len), x, y, anchor);
    }

    @Override
    public void drawChar(char character, int x, int y, int anchor) {
        drawString(String.valueOf(character), x, y, anchor);
    }

    @Override
    public void drawChars(char[] data, int offset, int length, int x, int y, int anchor) {
        if (data == null) return;
        drawString(new String(data, offset, length), x, y, anchor);
    }

    @Override
    public Font getFont() {
        return this.currentFont;
    }

    @Override
    public void setFont(Font font) {
        if (font != null) this.currentFont = font;
    }

    @Override
    public int getStrokeStyle() {
        return this.strokeStyle;
    }

    @Override
    public void setStrokeStyle(int style) {
        this.strokeStyle = style;
    }
}
