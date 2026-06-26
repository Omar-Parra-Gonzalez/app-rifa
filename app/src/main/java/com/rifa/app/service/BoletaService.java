package com.rifa.app.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class BoletaService {

    public byte[] generarBoleta(Integer numero) throws IOException {

        ClassPathResource resource =
                new ClassPathResource("static/boletas/boleta-base.jpg");

        BufferedImage imagen = ImageIO.read(resource.getInputStream());

        Graphics2D g2d = imagen.createGraphics();

        g2d.setRenderingHint(
                RenderingHints.KEY_TEXT_ANTIALIASING,
                RenderingHints.VALUE_TEXT_ANTIALIAS_ON
        );

        String numeroFormateado = String.format("#%02d", numero);

        Font fuente = new Font("Serif", Font.BOLD, 62);
        g2d.setFont(fuente);

        g2d.setColor(Color.BLACK);

        // Ajustaremos estas coordenadas después de la prueba
        int x = 250;
        int y = 540;

        g2d.drawString(numeroFormateado, x, y);

        g2d.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        ImageIO.write(imagen, "jpg", baos);

        return baos.toByteArray();
    }
}
