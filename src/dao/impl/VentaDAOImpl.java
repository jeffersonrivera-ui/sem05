
package dao.impl;

import conexion.ConexionBD;
import dao.VentaDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VentaDAOImpl implements VentaDAO {

    @Override
    public Map<String, Object> registrarVenta(int idPedido) {

        String sqlPedido = "SELECT estado FROM pedidos WHERE id_pedido = ? FOR UPDATE";

        String sqlPago = "SELECT COALESCE(SUM(monto), 0) AS total_pagado FROM pagos WHERE id_pedido = ? AND estado = 'Pagado'";

        String sqlTotal = "SELECT COALESCE(SUM(cantidad * precio), 0) AS total FROM detalle_pedido WHERE id_pedido = ?";

        String sqlVerificar = "SELECT id_venta FROM ventas WHERE id_pedido = ?";

        String sqlInsertar = "INSERT INTO ventas (id_pedido, total) VALUES (?, ?)";

        try (Connection connection = ConexionBD.getConnection()) {

            connection.setAutoCommit(false);

            try {
                // Verificar y bloquear el pedido
                String estadoPedido;

                try (PreparedStatement ps = connection.prepareStatement(sqlPedido)) {
                    ps.setInt(1, idPedido);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            connection.rollback();
                            System.out.println("El pedido no existe.");
                            return null;
                        }

                        estadoPedido = rs.getString("estado");
                    }
                }

                if (estadoPedido == null || estadoPedido.equalsIgnoreCase("CANCELADO")) {
                    connection.rollback();
                    System.out.println("No se puede registrar una venta de un pedido cancelado.");
                    return null;
                }

                // Calcular los pagos realizados
                double totalPagado = 0;

                try (PreparedStatement ps = connection.prepareStatement(sqlPago)) {
                    ps.setInt(1, idPedido);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            totalPagado = rs.getDouble("total_pagado");
                        }
                    }
                }

                // Calcular el total del pedido
                double total = 0;

                try (PreparedStatement ps = connection.prepareStatement(sqlTotal)) {
                    ps.setInt(1, idPedido);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            total = rs.getDouble("total");
                        }
                    }
                }

                if (total <= 0) {
                    connection.rollback();
                    System.out.println("El pedido no tiene detalles registrados.");
                    return null;
                }

                // Verificar que el pedido esté completamente pagado
                if (Math.abs(totalPagado - total) > 0.01) {

                    double saldoPendiente = total - totalPagado;

                    System.out.println("No se puede registrar la venta.");
                    System.out.println("Total del pedido: S/ " + total);
                    System.out.println("Total pagado: S/ " + totalPagado);

                    if (saldoPendiente > 0.01) {
                        System.out.println("Saldo pendiente: S/ " + saldoPendiente);
                    } else {
                        System.out.println("El monto pagado supera el total del pedido.");
                    }

                    connection.rollback();
                    return null;
                }

                // Verificar si ya existe una venta
                try (PreparedStatement ps = connection.prepareStatement(sqlVerificar)) {
                    ps.setInt(1, idPedido);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            connection.rollback();
                            System.out.println("Este pedido ya tiene una venta registrada.");
                            return null;
                        }
                    }
                }

                // Registrar venta
                int idVenta;

                try (PreparedStatement ps = connection.prepareStatement(
                        sqlInsertar, Statement.RETURN_GENERATED_KEYS)) {

                    ps.setInt(1, idPedido);
                    ps.setDouble(2, total);

                    int filas = ps.executeUpdate();

                    if (filas == 0) {
                        connection.rollback();
                        return null;
                    }

                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        if (!rs.next()) {
                            connection.rollback();
                            return null;
                        }

                        idVenta = rs.getInt(1);
                    }
                }

                connection.commit();

                Map<String, Object> venta = new HashMap<>();
                venta.put("id_venta", idVenta);
                venta.put("id_pedido", idPedido);
                venta.put("total", total);

                return venta;

            } catch (SQLException e) {
                connection.rollback();
                throw e;
            }

        } catch (SQLException e) {
            System.out.println("Error al registrar venta: " + e.getMessage());
            return null;
        }
    }

    @Override
    public List<Map<String, Object>> listarVentas() {

        String sql = "SELECT id_venta, id_pedido, total, fecha " +
                "FROM ventas ORDER BY id_venta";

        List<Map<String, Object>> ventas = new ArrayList<>();

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> venta = new HashMap<>();

                venta.put("id_venta", rs.getInt("id_venta"));
                venta.put("id_pedido", rs.getInt("id_pedido"));
                venta.put("total", rs.getDouble("total"));
                venta.put("fecha", rs.getString("fecha"));

                ventas.add(venta);
            }

        } catch (SQLException e) {
            System.out.println("Error al listar ventas: " + e.getMessage());
        }

        return ventas;
    }

    @Override
    public Map<String, Object> buscarVenta(int idVenta) {

        String sql = "SELECT id_venta, id_pedido, total, fecha FROM ventas WHERE id_venta = ?";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, idVenta);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    Map<String, Object> venta = new HashMap<>();

                    venta.put("id_venta", rs.getInt("id_venta"));
                    venta.put("id_pedido", rs.getInt("id_pedido"));
                    venta.put("total", rs.getDouble("total"));
                    venta.put("fecha", rs.getString("fecha"));

                    return venta;
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al buscar venta: " + e.getMessage());
        }

        return null;
    }
}
