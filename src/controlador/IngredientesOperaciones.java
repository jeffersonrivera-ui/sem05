package controlador;

import dao.IngredientesDAO;
import dao.impl.IngredientesDAOImpl;
import modelo.Ingrediente;

import java.util.List;

public class IngredientesOperaciones {

    private static final IngredientesDAO ingredienteDAO = new IngredientesDAOImpl();

    // REGISTRAR INGREDIENTE
    public static void registrarIngrediente(
            String nombre, String unidad, double stock) {

        if (nombre == null || nombre.trim().isEmpty()) {
            System.out.println("El nombre del ingrediente es obligatorio.");
            return;
        }

        if (unidad == null || unidad.trim().isEmpty()) {
            System.out.println("La unidad del ingrediente es obligatoria.");
            return;
        }

        if (!Double.isFinite(stock) || stock < 0) {
            System.out.println("El stock debe ser un número válido y no puede ser negativo.");
            return;
        }

        nombre = nombre.trim();
        unidad = unidad.trim();

        Ingrediente ingrediente = new Ingrediente(0, nombre, unidad, stock);

        int id = ingredienteDAO.insertar(ingrediente);

        if (id > 0) {
            System.out.println("Ingrediente registrado correctamente.");
            System.out.println("ID generado: " + id);
        } else {
            System.out.println("No se pudo registrar el ingrediente.");
        }
    }

    // LISTAR INGREDIENTES
    public static void listarIngredientes() {

        List<Ingrediente> ingredientes = ingredienteDAO.listar();

        if (ingredientes.isEmpty()) {
            System.out.println("No hay ingredientes registrados.");
            return;
        }

        for (Ingrediente ingrediente : ingredientes) {

            System.out.println("-------------------------");
            System.out.println("ID: " + ingrediente.getId());
            System.out.println("Nombre: " + ingrediente.getNombre());
            System.out.println("Unidad: " + ingrediente.getUnidad());
            System.out.println("Stock disponible: " + ingrediente.getStock() + " " + ingrediente.getUnidad());
        }
    }

    // BUSCAR INGREDIENTE
    public static void buscarIngrediente(int id) {

        if (id <= 0) {
            System.out.println("El ID debe ser mayor que cero.");
            return;
        }

        Ingrediente ingrediente = ingredienteDAO.buscarPorId(id);

        if (ingrediente != null) {
            ingrediente.mostrarInformacion();
        } else {
            System.out.println("No se encontro el ingrediente.");
        }
    }

    // ACTUALIZAR INGREDIENTE
    public static void actualizarIngrediente(
            int id, String nombre, String unidad, double stock) {

        if (id <= 0) {
            System.out.println("El ID debe ser mayor que cero.");
            return;
        }

        if (nombre == null || nombre.trim().isEmpty()) {
            System.out.println("El nombre es obligatorio.");
            return;
        }

        if (unidad == null || unidad.trim().isEmpty()) {
            System.out.println("La unidad es obligatoria.");
            return;
        }

        if (!Double.isFinite(stock) || stock < 0) {
            System.out.println("El stock debe ser un número válido y no puede ser negativo.");
            return;
        }

        Ingrediente ingrediente = new Ingrediente(id, nombre.trim(), unidad.trim(), stock);

        boolean actualizado = ingredienteDAO.actualizar(ingrediente);

        if (actualizado) {
            System.out.println("Ingrediente actualizado correctamente.");

            // Actualizar disponibilidad de los platos.
            PlatosOperaciones.actualizarDisponibilidadPlatos();

        } else {
            System.out.println("No se pudo actualizar el ingrediente.");
        }
    }

    // ELIMINAR INGREDIENTE
    public static void eliminarIngrediente(int id) {

        if (id <= 0) {
            System.out.println("El ID debe ser mayor que cero.");
            return;
        }

        boolean eliminado = ingredienteDAO.eliminar(id);

        if (eliminado) {
            System.out.println("Ingrediente eliminado correctamente.");

        } else {

            System.out.println("No se pudo eliminar el ingrediente.");
        }
    }

    // VERIFICAR EXISTENCIA
    public static Boolean existeIngrediente(int id) {

        if (id <= 0) {
            return false;
        }

        return ingredienteDAO.existe(id);
    }
}

