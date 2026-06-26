package com.rifa.app.dto;

import java.util.List;

public class RegistroRifaDTO {
    private String nombre;
    private String telefono;
    private String pago;
    private String alias;
    private List<String> numeros; // Aquí viaja el array de JS: ["02", "05"]

    // --- GETTERS Y SETTERS ---
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getPago() { return pago; }
    public void setPago(String pago) { this.pago = pago; }

    public String getAlias() {return alias;}
    public void setAlias(String alias) {this.alias = alias;}

    public List<String> getNumeros() { return numeros; }
    public void setNumeros(List<String> numeros) { this.numeros = numeros; }
}