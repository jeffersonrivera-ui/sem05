package dao;

import modelo.PlatoIngrediente;
import java.util.List;

public interface PlatoIngredienteDAO {

    boolean insertar(int idPlato, int idIngrediente, double cantidad);

    List<PlatoIngrediente> listarPorPlato(int idPlato);

    boolean actualizarCantidad(
            int idPlato, int idIngrediente, double cantidad);

    boolean eliminar(int idPlato, int idIngrediente);
}
