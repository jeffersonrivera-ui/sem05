package controlador;

import dao.VentaDAO;
import dao.impl.VentaDAOImpl;

import java.util.List;
import java.util.Map;

public class VentaOperaciones {

    private static final VentaDAO ventaDAO = new VentaDAOImpl();

    // REGISTRAR VENTA
    public static void registrarVenta(int idPedido) {

        if (idPedido <= 0) {
            System.out.println("Ingrese un ID de pedido válido.");
            return;
        }

        Map<String, Object> venta = ventaDAO.registrarVenta(idPedido);

        if (venta == null) {
            return;
        }

        System.out.println("========== VENTA REGISTRADA ==========");
        System.out.println("ID de venta: " + venta.get("id_venta"));
        System.out.println("ID del pedido: " + venta.get("id_pedido"));
        System.out.println("Total de la venta: S/ " + venta.get("total"));
        System.out.println("======================================");
    }

    // LISTAR VENTAS
    public static void listarVentas() {

        List<Map<String, Object>> ventas = ventaDAO.listarVentas();

        if (ventas == null || ventas.isEmpty()) {
            System.out.println("No hay ventas registradas.");
            return;
        }

        System.out.println("========== LISTA DE VENTAS ==========");

        for (Map<String, Object> venta : ventas) {

            System.out.println("-----------------------------------");
            System.out.println("ID de venta: " + venta.get("id_venta"));
            System.out.println("ID del pedido: " + venta.get("id_pedido"));
            System.out.println("Total: S/ " + venta.get("total"));
            System.out.println("Fecha: " + venta.get("fecha"));
        }

        System.out.println("====================================");
    }

    // BUSCAR VENTA
    public static void buscarVenta(int idVenta) {

        if (idVenta <= 0) {
            System.out.println("Ingrese un ID de venta válido.");
            return;
        }

        Map<String, Object> venta = ventaDAO.buscarVenta(idVenta);

        if (venta == null) {
            System.out.println("No se encontró la venta.");
            return;
        }

        System.out.println("========== INFORMACIÓN DE LA VENTA ==========");
        System.out.println("ID de venta: " + venta.get("id_venta"));
        System.out.println("ID del pedido: " + venta.get("id_pedido"));
        System.out.println("Total: S/ " + venta.get("total"));
        System.out.println("Fecha: " + venta.get("fecha"));
        System.out.println("============================================");
    }
}
