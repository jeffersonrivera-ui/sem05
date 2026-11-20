
package dao.impl;

import conexion.ConexionBD;
import dao.DetalleIngredienteExcluidoDAO;
import modelo.Ingrediente;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DetalleIngredienteExcluidoDAOImpl implements DetalleIngredienteExcluidoDAO {

    @Override
    public boolean insertar(int idDetalle, int idIngrediente) {

        if (idDetalle <= 0 || idIngrediente <= 0) {
            System.out.println("Los IDs deben ser mayores que cero.");
            return false;
        }

        String sqlPedido = "SELECT p.id_pedido, p.estado, p.inventario_descontado " +
                        "FROM pedidos p INNER JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido " +
                        "WHERE dp.id_detalle = ? FOR UPDATE";

        String sqlIngrediente = "SELECT COUNT(*) FROM detalle_pedido dp INNER JOIN plato_ingrediente pi ON dp.id_plato = pi.id_plato " +
                        "WHERE dp.id_detalle = ? AND pi.id_ingrediente = ?";

        String sqlInsertar = "INSERT INTO detalle_ingrediente_excluido (id_detalle, id_ingrediente) VALUES (?, ?)";

        try (Connection connection = ConexionBD.getConnection()) {

            connection.setAutoCommit(false);

            try {
                int idPedido;
                String estado;
                boolean inventarioDescontado;

                // 1. Buscar y bloquear el pedido
                try (PreparedStatement ps = connection.prepareStatement(sqlPedido)) {

                    ps.setInt(1, idDetalle);

                    try (ResultSet rs = ps.executeQuery()) {

                        if (!rs.next()) {
                            System.out.println("No se encontro el detalle del pedido.");
                            connection.rollback();
                            return false;
                        }

                        idPedido = rs.getInt("id_pedido");
                        estado = rs.getString("estado");
                        inventarioDescontado = rs.getBoolean("inventario_descontado");
                    }
                }

                // 2. Validar estado e inventario
                if (estado == null || (!estado.equalsIgnoreCase("PENDIENTE") && !estado.equalsIgnoreCase("EN PREPARACION")) || inventarioDescontado) {

                    System.out.println("No se pueden modificar las exclusiones de este pedido.");

                    connection.rollback();
                    return false;
                }

                // 3. Verificar pagos
                if (pedidoTienePagos(connection, idPedido)) {

                    System.out.println("No se pueden agregar exclusiones porque el pedido tiene pagos registrados.");

                    connection.rollback();
                    return false;
                }

                // 4. Verificar que el ingrediente pertenezca a la receta
                try (PreparedStatement ps = connection.prepareStatement(sqlIngrediente)) {

                    ps.setInt(1, idDetalle);
                    ps.setInt(2, idIngrediente);

                    try (ResultSet rs = ps.executeQuery()) {

                        rs.next();

                        if (rs.getInt(1) == 0) {

                            System.out.println("El ingrediente no pertenece a la receta de este plato.");

                            connection.rollback();
                            return false;
                        }
                    }
                }

                // 5. Registrar exclusión
                int filas;

                try (PreparedStatement ps =
                             connection.prepareStatement(sqlInsertar)) {

                    ps.setInt(1, idDetalle);
                    ps.setInt(2, idIngrediente);

                    filas = ps.executeUpdate();
                }

                if (filas > 0) {
                    connection.commit();
                    System.out.println("Ingrediente excluido correctamente.");
                    return true;
                }

                connection.rollback();
                System.out.println("No se pudo registrar la exclusion.");
                return false;

            } catch (SQLException e) {
                connection.rollback();
                throw e;
            }

        } catch (SQLException e) {
            System.out.println("Error al registrar exclusion: " + e.getMessage());
            return false;
        }
    }

    @Override
    public List<Ingrediente> listarPorDetalle(int idDetalle) {

        List<Ingrediente> ingredientes = new ArrayList<>();

        if (idDetalle <= 0) {
            System.out.println("El ID del detalle no es valido.");
            return ingredientes;
        }

        String sql = "SELECT i.id_ingrediente, i.nombre, i.unidad, i.stock FROM detalle_ingrediente_excluido de NNER JOIN ingredientes i " +
                        "ON de.id_ingrediente = i.id_ingrediente WHERE de.id_detalle = ? ORDER BY i.nombre";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, idDetalle);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {

                    Ingrediente ingrediente = new Ingrediente(
                            rs.getInt("id_ingrediente"),
                            rs.getString("nombre"),
                            rs.getString("unidad"),
                            rs.getDouble("stock")
                    );

                    ingredientes.add(ingrediente);
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al listar exclusiones: " + e.getMessage());
        }

        return ingredientes;
    }

    @Override
    public boolean eliminar(int idDetalle, int idIngrediente) {

        if (idDetalle <= 0 || idIngrediente <= 0) {
            System.out.println("Los IDs deben ser mayores que cero.");
            return false;
        }

        String sqlPedido = "SELECT p.id_pedido, p.estado, p.inventario_descontado FROM pedidos p INNER JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido WHERE dp.id_detalle = ? FOR UPDATE";

        String sqlEliminar = "DELETE FROM detalle_ingrediente_excluido WHERE id_detalle = ? AND id_ingrediente = ?";

        try (Connection connection = ConexionBD.getConnection()) {

            connection.setAutoCommit(false);

            try {
                int idPedido;
                String estado;
                boolean inventarioDescontado;

                // 1. Buscar y bloquear el pedido
                try (PreparedStatement ps = connection.prepareStatement(sqlPedido)) {

                    ps.setInt(1, idDetalle);

                    try (ResultSet rs = ps.executeQuery()) {

                        if (!rs.next()) {
                            System.out.println("No se encontro el detalle del pedido.");
                            connection.rollback();
                            return false;
                        }

                        idPedido = rs.getInt("id_pedido");
                        estado = rs.getString("estado");
                        inventarioDescontado = rs.getBoolean("inventario_descontado");
                    }
                }

                // 2. Validar estado e inventario
                if (estado == null || (!estado.equalsIgnoreCase("PENDIENTE") && !estado.equalsIgnoreCase("EN PREPARACION")) || inventarioDescontado) {

                    System.out.println("No se pueden modificar las exclusiones de este pedido.");

                    connection.rollback();
                    return false;
                }

                // 3. Verificar pagos
                if (pedidoTienePagos(connection, idPedido)) {

                    System.out.println("No se pueden eliminar exclusiones porque el pedido tiene pagos registrados.");

                    connection.rollback();
                    return false;
                }

                // 4. Eliminar exclusión
                int filas;

                try (PreparedStatement ps = connection.prepareStatement(sqlEliminar)) {

                    ps.setInt(1, idDetalle);
                    ps.setInt(2, idIngrediente);

                    filas = ps.executeUpdate();
                }

                if (filas > 0) {
                    connection.commit();
                    System.out.println("Exclusion eliminada correctamente.");
                    return true;
                }

                connection.rollback();
                System.out.println("No se encontro la exclusion.");
                return false;

            } catch (SQLException e) {
                connection.rollback();
                throw e;
            }

        } catch (SQLException e) {
            System.out.println("Error al eliminar exclusion: " + e.getMessage());
            return false;
        }
    }

    // VERIFICAR PAGOS DEL PEDIDO
    private boolean pedidoTienePagos(Connection connection, int idPedido) throws SQLException {

        String sql = "SELECT COUNT(*) FROM pagos WHERE id_pedido = ?";

        try (PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, idPedido);

            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1) > 0;
            }
        }
    }
}

