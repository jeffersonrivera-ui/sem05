package dao;

import modelo.Plato;
import java.util.List;

public interface PlatoDAO {

    int insertar(Plato plato);
    List<Plato> listar();
    Plato buscarPorId(int id);
    boolean actualizar(Plato plato);
    boolean eliminar(int id);
    Boolean existe(int id);
    void actualizarDisponibilidad();
    String obtenerEstado(int id);
}
