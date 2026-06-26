package com.rifa.app.controller;

import com.rifa.app.dto.ParticipanteVistaDTO;
import com.rifa.app.dto.RegistroRifaDTO;
import com.rifa.app.service.RifaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rifas")
@CrossOrigin(origins = "*")
public class RifaController {

    private final RifaService rifaService;

    public RifaController(RifaService rifaService) {
        this.rifaService = rifaService;
    }

    @GetMapping("/ocupados")
    public ResponseEntity<List<String>> getNumerosOcupados() {
        return ResponseEntity.ok(rifaService.obtenerNumerosOcupados());
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarCompra(@RequestBody RegistroRifaDTO registroDTO) {

        try {

            String mensajeWhatsApp =
                    rifaService.registrarParticipanteYBoletas(registroDTO);

            Map<String, Object> respuesta = new HashMap<>();

            respuesta.put("status", "OK");
            respuesta.put("mensaje", "Registro completado con éxito");
            respuesta.put("textoWhatsApp", mensajeWhatsApp);
            respuesta.put("telefono", registroDTO.getTelefono());

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {

            Map<String, String> errorResp = new HashMap<>();

            errorResp.put("error", "Error al registrar boletas.");

            return ResponseEntity.badRequest().body(errorResp);
        }
    }

    @PutMapping("/actualizar-pago/{telefono}")
    public ResponseEntity<?> actualizarPago(@PathVariable String telefono) {

        try {

            String mensajeWhatsApp =
                    rifaService.actualizarAPagado(telefono);

            Map<String, Object> respuesta = new HashMap<>();

            respuesta.put("status", "OK");
            respuesta.put("mensaje", "Estado actualizado a PAGADO con éxito");
            respuesta.put("textoWhatsApp", mensajeWhatsApp);
            respuesta.put("telefono", telefono);

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {

            Map<String, String> errorResp = new HashMap<>();

            errorResp.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(errorResp);
        }
    }

    @GetMapping("/participantes")
    public ResponseEntity<List<ParticipanteVistaDTO>> obtenerParticipantes() {

        return ResponseEntity.ok(
                rifaService.obtenerParticipantes()
        );
    }

    @GetMapping("/participantes-debe")
    public ResponseEntity<List<ParticipanteVistaDTO>> obtenerParticipantesDebe() {

        return ResponseEntity.ok(
                rifaService.obtenerParticipantesConDeuda()
        );
    }

    @GetMapping("/recordatorio/{telefono}")
    public ResponseEntity<?> enviarRecordatorio(
            @PathVariable String telefono) {

        try {

            String mensajeWhatsApp =
                    rifaService.generarRecordatorio(telefono);

            Map<String, Object> respuesta = new HashMap<>();

            respuesta.put("status", "OK");
            respuesta.put("textoWhatsApp", mensajeWhatsApp);
            respuesta.put("telefono", telefono);

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {

            Map<String, String> errorResp = new HashMap<>();

            errorResp.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(errorResp);
        }
    }
}