package dao;

import modelo.Ingrediente;
import java.util.List;

public interface DetalleIngredienteExcluidoDAO {

    boolean insertar(int idDetalle, int idIngrediente);

    List<Ingrediente> listarPorDetalle(int idDetalle);

    boolean eliminar(int idDetalle, int idIngrediente);
}
