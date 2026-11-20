package controlador;

import dao.PagoDAO;
import dao.impl.PagoDAOImpl;
import java.util.List;
import java.util.Map;

public class PagoOperaciones {

    private static final PagoDAO pagoDAO = new PagoDAOImpl();

    // REGISTRAR PAGO
    public static void registrarPago(int idPedido, double monto, String metodoPago) {

        if (idPedido <= 0) {
            System.out.println("El ID del pedido debe ser válido.");
            return;
        }

        if (!Double.isFinite(monto) || monto <= 0) {
            System.out.println("El monto debe ser mayor que cero.");
            return;
        }

        if (metodoPago == null || metodoPago.trim().isEmpty()) {
            System.out.println("Debe ingresar un método de pago.");
            return;
        }

        Map<String, Object> resultado = pagoDAO.registrarPago(idPedido, monto, metodoPago.trim());

        if (resultado == null) {
            System.out.println("No se pudo registrar el pago.");
            return;
        }

        System.out.println("\n========== PAGO REGISTRADO ==========");
        System.out.println("Código de pago: " + resultado.get("id_pago"));
        System.out.println("Código de pedido: " + resultado.get("id_pedido"));
        System.out.println("Monto pagado: S/ " + resultado.get("monto"));
        System.out.println("Método de pago: " + resultado.get("metodo_pago"));
        System.out.println("Total del pedido: S/ " + resultado.get("total_pedido"));
        System.out.println("Total pagado: S/ " + resultado.get("total_pagado"));
        System.out.println("Saldo pendiente: S/ " + resultado.get("saldo_pendiente"));
        System.out.println("=====================================");
    }

    // LISTAR PAGOS
    public static void listarPagos() {

        List<Map<String, Object>> pagos = pagoDAO.listarPagos();

        if (pagos == null || pagos.isEmpty()) {
            System.out.println("No hay pagos registrados.");
            return;
        }

        System.out.println("========== LISTA DE PAGOS ==========");

        for (Map<String, Object> pago : pagos) {
            System.out.println("-----------------------------------");
            System.out.println("Código de pago: " + pago.get("id_pago"));
            System.out.println("Código de pedido: " + pago.get("id_pedido"));
            System.out.println("Monto: S/ " + pago.get("monto"));
            System.out.println("Método: " + pago.get("metodo_pago"));
            System.out.println("Fecha: " + pago.get("fecha"));
            System.out.println("Estado: " + pago.get("estado"));
        }

        System.out.println("===================================");
    }

    // BUSCAR PAGO
    public static void buscarPago(int idPago) {

        if (idPago <= 0) {
            System.out.println("El ID del pago debe ser válido.");
            return;
        }

        Map<String, Object> pago = pagoDAO.buscarPago(idPago);

        if (pago == null) {
            System.out.println("No se encontró el pago.");
            return;
        }

        System.out.println("========== PAGO ENCONTRADO ==========");
        System.out.println("Código de pago: " + pago.get("id_pago"));
        System.out.println("Código de pedido: " + pago.get("id_pedido"));
        System.out.println("Monto: S/ " + pago.get("monto"));
        System.out.println("Método: " + pago.get("metodo_pago"));
        System.out.println("Fecha: " + pago.get("fecha"));
        System.out.println("Estado: " + pago.get("estado"));
        System.out.println("=====================================");
    }
}




