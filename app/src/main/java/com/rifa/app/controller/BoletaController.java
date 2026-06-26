package com.rifa.app.controller;

import com.rifa.app.service.BoletaService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/boletas")
@CrossOrigin(origins = "*")
public class BoletaController {

    private final BoletaService boletaService;

    public BoletaController(BoletaService boletaService) {
        this.boletaService = boletaService;
    }

    @GetMapping("/{numero}")
    public ResponseEntity<byte[]> descargarBoleta(
            @PathVariable Integer numero) throws Exception {

        byte[] imagen = boletaService.generarBoleta(numero);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=boleta_" + numero + ".jpg"
                )
                .contentType(MediaType.IMAGE_JPEG)
                .body(imagen);
    }
}
