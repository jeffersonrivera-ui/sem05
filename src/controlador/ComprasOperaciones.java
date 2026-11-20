package controlador;

import dao.CompraDAO;
import dao.impl.CompraDAOImpl;

import java.util.List;
import java.util.Map;

public class ComprasOperaciones {

    private static final CompraDAO compraDAO = new CompraDAOImpl();

    // REGISTRAR COMPRA
    public static int registrarCompra(int idIngrediente, double cantidad, double precioUnitario) {

        // Validaciones
        if (idIngrediente <= 0) {
            System.out.println("El ID del ingrediente no es valido.");
            return -1;
        }

        if (!Double.isFinite(cantidad) || cantidad <= 0) {
            System.out.println(
                    "La cantidad debe ser un número válido y mayor que cero.");
            return -1;
        }

        if (!Double.isFinite(precioUnitario) || precioUnitario < 0) {
            System.out.println(
                    "El precio debe ser un número válido y no puede ser negativo.");
            return -1;
        }

        double total = cantidad * precioUnitario;

        if (!Double.isFinite(total)) {
            System.out.println("El total de la compra no es valido.");
            return -1;
        }

        int idCompra = compraDAO.registrarCompra(idIngrediente, cantidad, precioUnitario);

        if (idCompra > 0) {

            System.out.println("================================");
            System.out.println("COMPRA REGISTRADA CORRECTAMENTE");
            System.out.println("================================");
            System.out.println("ID de compra: " + idCompra);
            System.out.println("Cantidad comprada: " + cantidad);
            System.out.println("Precio unitario: S/ " + precioUnitario);
            System.out.println("Total: S/ " + total);
            System.out.println("Stock actualizado correctamente.");

            // Actualizar disponibilidad de los platos.
            PlatosOperaciones.actualizarDisponibilidadPlatos();
        }

        return idCompra;
    }

    // LISTAR COMPRAS
    public static void listarCompras() {

        List<Map<String, Object>> compras = compraDAO.listarCompras();

        if (compras.isEmpty()) {
            System.out.println("No hay compras registradas.");
            return;
        }

        for (Map<String, Object> compra : compras) {

            System.out.println("================================");
            System.out.println("COMPRA N.° " + compra.get("id_compra"));
            System.out.println("================================");
            System.out.println("Fecha: " + compra.get("fecha"));
            System.out.println("Ingrediente: " + compra.get("nombre"));
            System.out.println("Cantidad: " + compra.get("cantidad") + " " + compra.get("unidad"));
            System.out.println("Precio unitario: S/ " + compra.get("precio_unitario"));
            System.out.println("Total: S/ " + compra.get("total"));
            System.out.println("--------------------------------");
        }
    }

    // BUSCAR COMPRA
    public static void buscarCompra(int idCompra) {

        if (idCompra <= 0) {
            System.out.println("El ID de compra no es valido.");
            return;
        }

        List<Map<String, Object>> compras = compraDAO.buscarCompra(idCompra);

        if (compras.isEmpty()) {
            System.out.println("No se encontro la compra.");
            return;
        }

        for (Map<String, Object> compra : compras) {

            System.out.println("================================");
            System.out.println("DETALLE DE COMPRA");
            System.out.println("================================");

            System.out.println("ID: " + compra.get("id_compra"));
            System.out.println("Fecha: " + compra.get("fecha"));
            System.out.println("Ingrediente: " + compra.get("nombre"));
            System.out.println("Cantidad: " + compra.get("cantidad") + " " + compra.get("unidad"));
            System.out.println("Precio unitario: S/ " + compra.get("precio_unitario"));
            System.out.println("Total: S/ " + compra.get("total"));
        }
    }
}

