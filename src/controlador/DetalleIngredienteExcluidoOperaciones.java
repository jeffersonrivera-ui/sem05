package controlador;

import dao.DetalleIngredienteExcluidoDAO;
import dao.impl.DetalleIngredienteExcluidoDAOImpl;
import modelo.Ingrediente;

import java.util.List;

public class DetalleIngredienteExcluidoOperaciones {

    private static final DetalleIngredienteExcluidoDAO exclusionDAO = new DetalleIngredienteExcluidoDAOImpl();

    // REGISTRAR EXCLUSION
    public static void registrarExclusion(int idDetalle, int idIngrediente) {

        if (idDetalle <= 0 || idIngrediente <= 0) {
            System.out.println("Los IDs deben ser mayores que cero.");
            return;
        }

        exclusionDAO.insertar(idDetalle, idIngrediente);
    }

    // LISTAR EXCLUSIONES
    public static void listarExclusiones(int idDetalle) {

        if (idDetalle <= 0) {
            System.out.println("El ID del detalle no es valido.");
            return;
        }

        List<Ingrediente> ingredientes = exclusionDAO.listarPorDetalle(idDetalle);

        System.out.println("====== INGREDIENTES EXCLUIDOS ======");

        if (ingredientes.isEmpty()) {
            System.out.println("Este detalle no tiene ingredientes excluidos.");
            return;
        }

        for (Ingrediente ingrediente : ingredientes) {

            System.out.println("-------------------------");
            System.out.println("ID ingrediente: " + ingrediente.getId());
            System.out.println("Ingrediente: " + ingrediente.getNombre());
            System.out.println("Unidad: " + ingrediente.getUnidad());
        }
    }

    // ELIMINAR EXCLUSION
    public static void eliminarExclusion(int idDetalle, int idIngrediente) {

        if (idDetalle <= 0 || idIngrediente <= 0) {
            System.out.println("Los IDs deben ser mayores que cero.");
            return;
        }

        exclusionDAO.eliminar(idDetalle, idIngrediente);
    }
}




