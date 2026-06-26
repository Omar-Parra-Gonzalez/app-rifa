package com.rifa.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participantes")
public class Participante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String telefono;

    @Column(name = "numero_boleta", nullable = false, unique = true)
    private String numeroBoleta;

    private String pago;

    @Column(name = "fecha_registro", updatable = false, insertable = false)
    private LocalDateTime fechaRegistro;

    // --- CONSTRUCTORES ---
    public Participante() {}

    public Participante(String nombre, String telefono, String numeroBoleta, String pago) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.numeroBoleta = numeroBoleta;
        this.pago = pago;
    }

    // --- GETTERS Y SETTERS ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getNumeroBoleta() { return numeroBoleta; }
    public void setNumeroBoleta(String numeroBoleta) { this.numeroBoleta = numeroBoleta; }

    public String getPago() { return pago; }
    public void setPago(String pago) { this.pago = pago; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }

    private String alias;
    public Participante(String nombre, String telefono, String numeroBoleta, String pago, String alias) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.numeroBoleta = numeroBoleta;
        this.pago = pago;
        this.alias = alias; //
    }
    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
}

