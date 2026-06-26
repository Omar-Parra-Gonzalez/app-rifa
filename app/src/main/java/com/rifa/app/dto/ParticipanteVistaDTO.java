package com.rifa.app.dto;

import java.util.List;

public class ParticipanteVistaDTO {

    private String nombre;
    private String telefono;
    private String pago;
    private List<String> numeros;
    private String alias;

    public ParticipanteVistaDTO(
            String nombre,
            String telefono,
            String pago,
            List<String> numeros,
            String alias){

        this.nombre = nombre;
        this.telefono = telefono;
        this.pago = pago;
        this.numeros = numeros;
        this.alias = alias;
    }

    public String getNombre() {
        return nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getPago() {
        return pago;
    }

    public List<String> getNumeros() {
        return numeros;
    }

    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
}
