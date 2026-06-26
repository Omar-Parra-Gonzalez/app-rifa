package com.rifa.app.service;

import com.rifa.app.dto.RegistroRifaDTO;
import com.rifa.app.model.Participante;
import com.rifa.app.repository.ParticipanteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.ArrayList;
import com.rifa.app.dto.ParticipanteVistaDTO;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class RifaService {

    private final ParticipanteRepository participanteRepository;

    public RifaService(ParticipanteRepository participanteRepository) {
        this.participanteRepository = participanteRepository;
    }

    public List<String> obtenerNumerosOcupados() {
        return participanteRepository.findAllNumeroBoletas();
    }

    @Transactional
    public String registrarParticipanteYBoletas(RegistroRifaDTO dto) {

        for (String numero : dto.getNumeros()) {
            Participante participante = new Participante(
                    dto.getNombre(),
                    dto.getTelefono(),
                    numero,
                    dto.getPago(),
                    dto.getAlias());

            participanteRepository.save(participante);
        }

        String numerosUnidos = String.join(", ", dto.getNumeros());

        boolean variasBoletas = dto.getNumeros().size() > 1;

        String encabezado = "¡Hola " + dto.getNombre() + "! 🎉 ¡Ya quedó oficialmente apartada "
                + (variasBoletas ? "tus boletas" : "tu boleta")
                + "! 🥳\n\n"

                + "Primero que todo quiero darte las gracias de corazón por apoyarme en esta gran rifa de la Cámara GoPro HERO 📸. ¡Tu apoyo significa muchísimo para mí!\n\n"

                + "Aquí te entrego formalmente "
                + (variasBoletas ? "tus números" : "tu número")
                + ":\n\n"

                + "🎟️ "
                + (variasBoletas ? "Boletas # " : "Boleta # ")
                + numerosUnidos + "\n\n"

                + "(Te adjunto la foto de tu boleta para que la tengas guardada) 👆\n\n";

        String cierreMensaje =
                "🏁 Recuerda los datos del sorteo:\n\n"

                        + "📅 Fecha: Viernes 12 de junio de 2026.\n\n"

                        + "🎰 Lotería: Juega con las últimas dos cifras de Chontico Día.\n\n"

                        + "Si quieres antojarte y ver todo lo que puedes hacer y grabar con este camarón si te la ganas, puedes revisar sus características completas aquí:\n\n"

                        + "👉 Especificaciones de la Cámara: omar-parra-gonzalez.github.io/rifa/\n\n"

                        + "¡Te deseo la mejor de las suertes y ojalá esa GoPro se vaya para tu casa! 🍀🚀✨";

        // ==========================
        // PAGADO
        // ==========================
        if ("pagado".equalsIgnoreCase(dto.getPago())
                || "pago".equalsIgnoreCase(dto.getPago())) {

            return encabezado + cierreMensaje;
        }

        // ==========================
        // DEBE
        // ==========================
        String bloqueCobro =
                "El valor de la boleta es de $10.000 y puedes cancelarla de una vez o antes del 1 de junio por cualquiera de estos medios:\n\n"

                        + "📱 Opción 1: Escaneando el código QR que te enviaré a continuación.\n\n"

                        + "🔢 Opción 2: Transfiriendo a Nequi o Llave al número: 3184935249\n\n"

                        + "Apenas realices el pago, me compartes el comprobante por aquí para registrarla de una vez en la lista de PAGADAS. 😉\n\n";

        return encabezado + bloqueCobro + cierreMensaje;
    }

    @Transactional
    public String actualizarAPagado(String telefono) {
        List<Participante> participantes = participanteRepository.findByTelefono(telefono);
        if (participantes.isEmpty()) {
            throw new RuntimeException("No se encontró ningún participante con el teléfono: " + telefono);
        }

        String nombre = participantes.get(0).getNombre();
        List<String> numeros = new ArrayList<>();

        for (Participante p : participantes) {
            p.setPago("pagado");
            participanteRepository.save(p);
            numeros.add(p.getNumeroBoleta());
        }

        String numerosUnidos = String.join(", ", numeros);
        String conceptoBoleta = numeros.size() > 1
                ? "tus boletas están marcadas como PAGADAS"
                : "tu boleta está marcada como PAGADA";
        return "¡Hola " + nombre
                + "! 🎉 Paso por aquí para agradecerte nuevamente por tu apoyo con la rifa de la GoPro HERO.\n\n" +
                "Te confirmo que ya he recibido tu pago y " + conceptoBoleta + " en la lista. ✅\n\n" +
                "Te recuerdo los detalles para que los tengas presentes:\n\n" +
                "📅 Fecha del sorteo: Viernes 12 de junio de 2026.\n\n" +
                "🎰 Modalidad: Últimas dos cifras del Chontico Día.\n\n" +
                "¡Muchísimas gracias por confiar y mucha suerte en el sorteo! 🍀🚀";
    }

    public List<ParticipanteVistaDTO> obtenerParticipantes() {
        List<Participante> registros = participanteRepository.findAll();
        Map<String, ParticipanteVistaDTO> agrupados = new LinkedHashMap<>();
        for (Participante p : registros) {
            if (!agrupados.containsKey(p.getTelefono())) {
                String estadoPago = p.getPago() != null ? p.getPago().toLowerCase() : "debe";
                if (estadoPago.equals("pago") || estadoPago.equals("pagado")) {
                    estadoPago = "pagado";
                }
                agrupados.put(
                        p.getTelefono(),
                        new ParticipanteVistaDTO(
                                p.getNombre(),
                                p.getTelefono(),
                                estadoPago,
                                new ArrayList<>(),
                                p.getAlias()));
            }
            agrupados
                    .get(p.getTelefono())
                    .getNumeros()
                    .add(p.getNumeroBoleta());
        }
        return new ArrayList<>(agrupados.values());
    }
    public List<ParticipanteVistaDTO> obtenerParticipantesConDeuda() {
        return obtenerParticipantes().stream()
                .filter(p ->
                        p.getPago() != null &&
                                p.getPago().equalsIgnoreCase("debe"))
                .toList();
    }

    public String generarRecordatorio(String telefono) {

        List<Participante> participantes =
                participanteRepository.findByTelefono(telefono);

        if (participantes.isEmpty()) {
            throw new RuntimeException(
                    "No se encontró ningún participante con el teléfono: " + telefono
            );
        }

        // Obtenemos el nombre del primer registro asociado al teléfono
        String nombre = participantes.get(0).getNombre();

        return "¡Hola " + nombre + "! 🎉 ¿Cómo estás? Solo paso a recordarte los medios de pago. 👇\n\n"
                + "📱 Opción 1: Escaneando el código QR que te envié anteriormente.\n\n"
                + "🔢 Opción 2: Transfiriendo a Nequi o Llave al número: 3184935249\n\n"
                + "📅 Recuerda que juega el viernes 12 de junio de 2026. ¡No te quedes por fuera!\n\n"
                + "¡Muchísima suerte! Que la buena energía esté de tu lado. 🍀🚀";
    }
}