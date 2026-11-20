package dao;

import java.util.List;
import modelo.Empleado;

public interface EmpleadoDAO {

    int insertar(Empleado empleado);
    List<Empleado> listar();
    boolean actualizarEstado(String dni, String estado);
}
