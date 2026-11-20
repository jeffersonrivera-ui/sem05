
package dao;

import java.util.List;
import modelo.Ingrediente;

public interface IngredientesDAO {
    int insertar(Ingrediente ingrediente);
    List<Ingrediente> listar();
    Ingrediente buscarPorId(int id);
    boolean actualizar(Ingrediente ingrediente);
    boolean eliminar(int id);
    boolean existe(int id);
}
