
package controlador;

import dao.PlatoDAO;
import dao.impl.PlatoDAOImpl;
import modelo.Plato;

import java.util.List;

public class PlatosOperaciones {

    private static final PlatoDAO platoDAO = new PlatoDAOImpl();

    public static void registrarPlato(String nombre, double precio) {

        if (nombre == null || nombre.trim().isEmpty()) {
            System.out.println("El nombre del plato es obligatorio.");
            return;
        }

        if (!Double.isFinite(precio) || precio <= 0) {
            System.out.println("El precio debe ser mayor que cero.");
            return;
        }

        Plato plato = new Plato(0, nombre.trim(), precio);

        int id = platoDAO.insertar(plato);

        if (id > 0) {

            System.out.println("Plato registrado correctamente.");
            System.out.println("ID generado: " + id);
            System.out.println("Estado: INACTIVO (debe registrar su receta).");

        } else {
            System.out.println("No se pudo registrar el plato.");

        }
    }

    public static void actualizarDisponibilidadPlatos() {
        platoDAO.actualizarDisponibilidad();
    }

    public static void listarPlatos() {

        List<Plato> platos = platoDAO.listar();

        if (platos.isEmpty()) {
            System.out.println("No hay platos registrados.");
            return;
        }

        for (Plato plato : platos) {

            System.out.println("-------------------------");
            System.out.println("ID: " + plato.getId());
            System.out.println("Nombre: " + plato.getNombre());
            System.out.println("Precio: S/ " + plato.getPrecio());
            System.out.println("Estado: " + platoDAO.obtenerEstado(plato.getId()));
        }
    }

    public static void buscarPlato(int id) {

        if (id <= 0) {
            System.out.println("El ID debe ser mayor que cero.");
            return;
        }

        Plato plato = platoDAO.buscarPorId(id);

        if (plato == null) {
            System.out.println("No se encontro el plato.");
            return;
        }

        System.out.println("-------------------------");
        System.out.println("ID: " + plato.getId());
        System.out.println("Nombre: " + plato.getNombre());
        System.out.println("Precio: S/ " + plato.getPrecio());
        System.out.println("Estado: " + platoDAO.obtenerEstado(plato.getId()));
    }

    public static void actualizarPlato(int id, String nombre, double precio) {

        if (id <= 0) {
            System.out.println("El ID debe ser mayor que cero.");
            return;
        }

        if (nombre == null || nombre.trim().isEmpty()) {
            System.out.println("El nombre del plato es obligatorio.");
            return;
        }

        if (!Double.isFinite(precio) || precio <= 0) {
            System.out.println("El precio debe ser mayor que cero.");
            return;
        }

        Plato plato = new Plato(id, nombre.trim(), precio);

        if (platoDAO.actualizar(plato)) {
            System.out.println("Plato actualizado correctamente.");

        } else {
            System.out.println("No se encontro el plato o no se pudo actualizar.");

        }
    }

    public static void eliminarPlato(int id) {

        if (id <= 0) {
            System.out.println("El ID debe ser mayor que cero.");

            return;
        }

        if (platoDAO.eliminar(id)) {
            System.out.println("Plato eliminado correctamente.");

        } else {
            System.out.println("No se pudo eliminar el plato.");

        }
    }

    public static Boolean existePlato(int id) {

        if (id <= 0) {
            return false;
        }

        return platoDAO.existe(id);
    }
}

