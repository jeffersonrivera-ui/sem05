
package dao.impl;

import conexion.ConexionBD;
import dao.DetallePedidoDAO;
import modelo.DetallePedido;
import modelo.Pedido;
import modelo.Plato;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DetallePedidoDAOImpl implements DetallePedidoDAO {

    @Override
    public int insertar(int idPedido, int idPlato, int cantidad, String observacion) {

        if (cantidad <= 0) {
            System.out.println("La cantidad debe ser mayor que cero.");
            return -1;
        }

        String sqlPedido = "SELECT estado FROM pedidos WHERE id_pedido = ? FOR UPDATE";
        String sqlPrecio = "SELECT precio FROM platos WHERE id_plato = ? AND activo = TRUE";
        String sqlInsertar = "INSERT INTO detalle_pedido " +
                "(id_pedido, id_plato, cantidad, precio, observacion) VALUES (?, ?, ?, ?, ?)";

        try (Connection connection = ConexionBD.getConnection()) {

            connection.setAutoCommit(false);

            try {
                String estado;

                try (PreparedStatement ps = connection.prepareStatement(sqlPedido)) {
                    ps.setInt(1, idPedido);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            System.out.println("El pedido no existe.");
                            connection.rollback();
                            return -1;
                        }
                        estado = rs.getString("estado");
                    }
                }

                if (estado == null ||
                        (!estado.equalsIgnoreCase("PENDIENTE")
                                && !estado.equalsIgnoreCase("EN PREPARACION"))) {
                    System.out.println("No se pueden agregar platos a un pedido finalizado.");
                    connection.rollback();
                    return -1;
                }

                if (pedidoTienePagos(connection, idPedido)) {
                    System.out.println("El pedido tiene pagos registrados.");
                    connection.rollback();
                    return -1;
                }

                double precio;

                try (PreparedStatement ps = connection.prepareStatement(sqlPrecio)) {
                    ps.setInt(1, idPlato);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            System.out.println("El plato no existe o no está activo.");
                            connection.rollback();
                            return -1;
                        }
                        precio = rs.getDouble("precio");
                    }
                }

                int idDetalle = -1;

                try (PreparedStatement ps = connection.prepareStatement(
                        sqlInsertar, Statement.RETURN_GENERATED_KEYS)) {

                    ps.setInt(1, idPedido);
                    ps.setInt(2, idPlato);
                    ps.setInt(3, cantidad);
                    ps.setDouble(4, precio);
                    ps.setString(5, observacion);

                    if (ps.executeUpdate() > 0) {
                        try (ResultSet rs = ps.getGeneratedKeys()) {
                            if (rs.next()) {
                                idDetalle = rs.getInt(1);
                            }
                        }
                    }
                }

                if (idDetalle > 0) {
                    connection.commit();
                    System.out.println("Detalle registrado correctamente.");
                    System.out.println("ID del detalle: " + idDetalle);
                    System.out.println("Precio unitario: S/ " + precio);
                    System.out.println("Subtotal: S/ " + (cantidad * precio));
                    return idDetalle;
                }

                connection.rollback();
                System.out.println("No se pudo registrar el detalle.");
                return -1;

            } catch (SQLException e) {
                connection.rollback();
                throw e;
            }

        } catch (SQLException e) {
            System.out.println("Error al registrar detalle: " + e.getMessage());
            return -1;
        }
    }

    @Override
    public List<DetallePedido> listarPorPedido(int idPedido) {

        List<DetallePedido> detalles = new ArrayList<>();

        String sql = "SELECT d.id_detalle, d.id_pedido, d.id_plato, " +
                "pl.nombre, d.cantidad, d.precio, d.observacion, " +
                "p.estado, p.fecha " +
                "FROM detalle_pedido d " +
                "INNER JOIN platos pl ON d.id_plato = pl.id_plato " +
                "INNER JOIN pedidos p ON d.id_pedido = p.id_pedido " +
                "WHERE d.id_pedido = ? ORDER BY d.id_detalle";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, idPedido);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    detalles.add(mapearDetalle(rs));
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al listar detalles: " + e.getMessage());
        }

        return detalles;
    }

    @Override
    public DetallePedido buscarPorId(int idDetalle) {

        String sql = "SELECT d.id_detalle, d.id_pedido, d.id_plato, " +
                "pl.nombre, d.cantidad, d.precio, d.observacion, " +
                "p.estado, p.fecha " +
                "FROM detalle_pedido d " +
                "INNER JOIN platos pl ON d.id_plato = pl.id_plato " +
                "INNER JOIN pedidos p ON d.id_pedido = p.id_pedido " +
                "WHERE d.id_detalle = ?";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, idDetalle);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearDetalle(rs);
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al buscar detalle: " + e.getMessage());
        }

        return null;
    }

    @Override
    public boolean actualizar(int idDetalle, int cantidad, String observacion) {

        if (cantidad <= 0) {
            System.out.println("La cantidad debe ser mayor que cero.");
            return false;
        }

        String sqlValidar = "SELECT p.id_pedido, p.estado " +
                "FROM pedidos p " +
                "INNER JOIN detalle_pedido d ON p.id_pedido = d.id_pedido " +
                "WHERE d.id_detalle = ? FOR UPDATE";

        String sqlActualizar = "UPDATE detalle_pedido " +
                "SET cantidad = ?, observacion = ? WHERE id_detalle = ?";

        try (Connection connection = ConexionBD.getConnection()) {

            connection.setAutoCommit(false);

            try {
                int idPedido;
                String estado;

                try (PreparedStatement ps = connection.prepareStatement(sqlValidar)) {
                    ps.setInt(1, idDetalle);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            System.out.println("No se encontró el detalle.");
                            connection.rollback();
                            return false;
                        }

                        idPedido = rs.getInt("id_pedido");
                        estado = rs.getString("estado");
                    }
                }

                if (estado == null ||
                        (!estado.equalsIgnoreCase("PENDIENTE")
                                && !estado.equalsIgnoreCase("EN PREPARACION"))) {
                    System.out.println("No se puede modificar un pedido finalizado.");
                    connection.rollback();
                    return false;
                }

                if (pedidoTienePagos(connection, idPedido)) {
                    System.out.println("El pedido tiene pagos registrados.");
                    connection.rollback();
                    return false;
                }

                int filas;

                try (PreparedStatement ps = connection.prepareStatement(sqlActualizar)) {
                    ps.setInt(1, cantidad);
                    ps.setString(2, observacion);
                    ps.setInt(3, idDetalle);
                    filas = ps.executeUpdate();
                }

                if (filas > 0) {
                    connection.commit();
                    System.out.println("Detalle actualizado correctamente.");
                    return true;
                }

                connection.rollback();
                System.out.println("No se pudo actualizar el detalle.");
                return false;

            } catch (SQLException e) {
                connection.rollback();
                throw e;
            }

        } catch (SQLException e) {
            System.out.println("Error al actualizar detalle: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean eliminar(int idDetalle) {

        String sqlValidar = "SELECT p.id_pedido, p.estado " +
                "FROM pedidos p " +
                "INNER JOIN detalle_pedido d ON p.id_pedido = d.id_pedido " +
                "WHERE d.id_detalle = ? FOR UPDATE";

        String sqlExclusiones =
                "DELETE FROM detalle_ingrediente_excluido WHERE id_detalle = ?";

        String sqlEliminar =
                "DELETE FROM detalle_pedido WHERE id_detalle = ?";

        try (Connection connection = ConexionBD.getConnection()) {

            connection.setAutoCommit(false);

            try {
                int idPedido;
                String estado;

                try (PreparedStatement ps = connection.prepareStatement(sqlValidar)) {
                    ps.setInt(1, idDetalle);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            System.out.println("No se encontró el detalle.");
                            connection.rollback();
                            return false;
                        }

                        idPedido = rs.getInt("id_pedido");
                        estado = rs.getString("estado");
                    }
                }

                if (estado == null ||
                        (!estado.equalsIgnoreCase("PENDIENTE")
                                && !estado.equalsIgnoreCase("EN PREPARACION"))) {
                    System.out.println("No se puede eliminar un detalle de un pedido finalizado.");
                    connection.rollback();
                    return false;
                }

                if (pedidoTienePagos(connection, idPedido)) {
                    System.out.println("El pedido tiene pagos registrados.");
                    connection.rollback();
                    return false;
                }

                try (PreparedStatement ps = connection.prepareStatement(sqlExclusiones)) {
                    ps.setInt(1, idDetalle);
                    ps.executeUpdate();
                }

                int filas;

                try (PreparedStatement ps = connection.prepareStatement(sqlEliminar)) {
                    ps.setInt(1, idDetalle);
                    filas = ps.executeUpdate();
                }

                if (filas > 0) {
                    connection.commit();
                    System.out.println("Detalle eliminado correctamente.");
                    return true;
                }

                connection.rollback();
                System.out.println("No se pudo eliminar el detalle.");
                return false;

            } catch (SQLException e) {
                connection.rollback();
                throw e;
            }

        } catch (SQLException e) {
            System.out.println("Error al eliminar detalle: " + e.getMessage());
            return false;
        }
    }

    @Override
    public double calcularTotal(int idPedido) {

        String sql = "SELECT COALESCE(SUM(cantidad * precio), 0) AS total " +
                "FROM detalle_pedido WHERE id_pedido = ?";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, idPedido);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("total");
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al calcular total: " + e.getMessage());
        }

        return -1;
    }

    private boolean pedidoTienePagos(Connection connection, int idPedido)
            throws SQLException {

        String sql = "SELECT COUNT(*) FROM pagos WHERE id_pedido = ?";

        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, idPedido);

            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1) > 0;
            }
        }
    }

    private DetallePedido mapearDetalle(ResultSet rs) throws SQLException {

        int idPedido = rs.getInt("id_pedido");

        Pedido pedido = new Pedido(
                idPedido,
                null,
                null,
                rs.getString("fecha"),
                rs.getString("estado")
        );

        Plato plato = new Plato(
                rs.getInt("id_plato"),
                rs.getString("nombre"),
                rs.getDouble("precio")
        );

        return new DetallePedido(
                rs.getInt("id_detalle"),
                pedido,
                plato,
                rs.getInt("cantidad"),
                rs.getDouble("precio"),
                rs.getString("observacion")
        );
    }
}
