package com.rifa.app;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class FiltroAlquiler implements Filter {

    // 🔑 Nombre unificado y con fecha de respaldo por si acaso
    @Value("${app.alquiler.fecha-vence:2026-07-28T14:52:00}")
    private String fechaVence;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // 🔓 Habilitar cabeceras CORS para desarrollo y producción
        httpResponse.setHeader("Access-Control-Allow-Origin", "*");
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", "*");

        // Si es una petición de control (OPTIONS) que hace el navegador, respondemos OK
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // ⏱️ Usamos la variable correcta "fechaVence"
        LocalDateTime fechaVencimiento = LocalDateTime.parse(fechaVence);
        LocalDateTime fechaActual = LocalDateTime.now();

        // Si ya expiró el tiempo, bloqueamos con código 403
        if (fechaActual.isAfter(fechaVencimiento)) {
            httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403 Forbidden
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write("{\"status\": \"BLOQUEADO\"}");
            return; // Detiene la petición de una
        }

        chain.doFilter(request, response);
    }
}