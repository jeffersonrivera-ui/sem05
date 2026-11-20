
package controlador;

import dao.PlatoIngredienteDAO;
import dao.impl.PlatoIngredienteDAOImpl;
import modelo.PlatoIngrediente;

import java.util.List;

public class PlatoIngredienteOperaciones {

    private static final PlatoIngredienteDAO recetaDAO =
            new PlatoIngredienteDAOImpl();

    public static void registrarIngredientePlato(
            int idPlato, int idIngrediente, double cantidad) {

        if (idPlato <= 0 || idIngrediente <= 0) {
            System.out.println("Los ID deben ser mayores que cero.");
            return;
        }

        if (!Double.isFinite(cantidad) || cantidad <= 0) {
            System.out.println("La cantidad debe ser mayor que cero.");
            return;
        }

        boolean registrado =
                recetaDAO.insertar(idPlato, idIngrediente, cantidad);

        if (registrado) {
            System.out.println(
                    "Ingrediente agregado a la receta correctamente.");

            PlatosOperaciones.actualizarDisponibilidadPlatos();

        } else {
            System.out.println(
                    "No se pudo agregar. Verifique los ID o si el ingrediente ya pertenece a la receta.");
        }
    }

    public static void listarIngredientesPlato(int idPlato) {

        if (idPlato <= 0) {
            System.out.println("El ID del plato debe ser mayor que cero.");
            return;
        }

        List<PlatoIngrediente> lista =
                recetaDAO.listarPorPlato(idPlato);

        System.out.println("====== INGREDIENTES DE LA RECETA ======");

        if (lista.isEmpty()) {
            System.out.println(
                    "Este plato todavía no tiene ingredientes registrados.");
            return;
        }

        for (PlatoIngrediente relacion : lista) {

            System.out.println("-------------------------");
            System.out.println("ID ingrediente: "
                    + relacion.getIngrediente().getId());

            System.out.println("Ingrediente: "
                    + relacion.getIngrediente().getNombre());

            System.out.println("Cantidad necesaria: "
                    + relacion.getCantidad() + " "
                    + relacion.getIngrediente().getUnidad());

            System.out.println("Stock disponible: "
                    + relacion.getIngrediente().getStock() + " "
                    + relacion.getIngrediente().getUnidad());
        }
    }

    public static void actualizarCantidadIngrediente(
            int idPlato, int idIngrediente, double cantidad) {

        if (idPlato <= 0 || idIngrediente <= 0) {
            System.out.println("Los ID deben ser mayores que cero.");
            return;
        }

        if (!Double.isFinite(cantidad) || cantidad <= 0) {
            System.out.println("La cantidad debe ser mayor que cero.");
            return;
        }

        boolean actualizado =
                recetaDAO.actualizarCantidad(
                        idPlato, idIngrediente, cantidad);

        if (actualizado) {
            System.out.println("Cantidad actualizada correctamente.");

            PlatosOperaciones.actualizarDisponibilidadPlatos();

        } else {
            System.out.println(
                    "No se pudo actualizar. Verifique la receta o si el plato tiene pedidos con inventario descontado.");
        }
    }

    public static void eliminarIngredientePlato(
            int idPlato, int idIngrediente) {

        if (idPlato <= 0 || idIngrediente <= 0) {
            System.out.println("Los ID deben ser mayores que cero.");
            return;
        }

        boolean eliminado =
                recetaDAO.eliminar(idPlato, idIngrediente);

        if (eliminado) {
            System.out.println(
                    "Ingrediente eliminado de la receta correctamente.");

            PlatosOperaciones.actualizarDisponibilidadPlatos();

        } else {
            System.out.println(
                    "No se pudo eliminar. Verifique la receta, los pedidos y las personalizaciones.");
        }
    }
}



