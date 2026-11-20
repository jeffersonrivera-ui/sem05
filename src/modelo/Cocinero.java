package modelo;

import java.time.LocalDate;

public class Cocinero extends Empleado {

    public Cocinero(int id, String nombres, String telefono, String apellidos, String direccion, String dni, String contactoEmergencia, String correo,
                    String distrito, String provincia, String departamento, String codigoPostal, String referenciaDireccion, double salario, String turnoLaboral, LocalDate fechaContratacion, String estadoLaboral) {

        super(id, nombres,telefono, apellidos, "Cocinero", direccion, dni, contactoEmergencia, correo, distrito, provincia, departamento, codigoPostal, referenciaDireccion, salario, turnoLaboral, fechaContratacion,
                estadoLaboral);
    }

    public void marcarPedidoListo() {
        System.out.println("El cocinero marca el pedido como listo.");
    }

    @Override
    public void realizarFuncion() {
        System.out.println("El cocinero prepara los platos.");
    }
}
