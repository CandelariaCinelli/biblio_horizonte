package com.biblioteca.horizonte.dominio.modelo;

/**
 * Módulos pedagógicos predefinidos del turno escolar (RF03, RF10).
 */
public enum ModuloHorario {
    MODULO_1("Módulo 1 (07:30 - 08:50)"),
    MODULO_2("Módulo 2 (09:00 - 10:20)"),
    MODULO_3("Módulo 3 (10:30 - 11:50)"),
    MODULO_4("Módulo 4 (13:30 - 14:50)"),
    MODULO_5("Módulo 5 (15:00 - 16:20)"),
    MODULO_6("Módulo 6 (16:30 - 17:50)");

    private final String etiqueta;

    ModuloHorario(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public static ModuloHorario desdeEtiqueta(String etiqueta) {
        for (ModuloHorario m : values()) {
            if (m.etiqueta.equalsIgnoreCase(etiqueta) || m.name().equalsIgnoreCase(etiqueta)) {
                return m;
            }
        }
        throw new IllegalArgumentException("Módulo horario no reconocido: " + etiqueta);
    }
}
