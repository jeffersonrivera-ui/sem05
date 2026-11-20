
package dao.impl;

import conexion.ConexionBD;
import dao.PlatoIngredienteDAO;
import modelo.Plato;
import modelo.Ingrediente;
import modelo.PlatoIngrediente;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PlatoIngredienteDAOImpl implements PlatoIngredienteDAO {

    @Override
    public boolean insertar(int idPlato, int idIngrediente, double cantidad) {

        String sqlPlato = "SELECT id_plato FROM platos WHERE id_plato = ?";
        String sqlIngrediente =
                "SELECT id_ingrediente FROM ingredientes WHERE id_ingrediente = ?";
        String sqlDuplicado =
                "SELECT id_plato_ingrediente FROM plato_ingrediente " +
                        "WHERE id_plato = ? AND id_ingrediente = ?";
        String sqlInsertar =
                "INSERT INTO plato_ingrediente " +
                        "(id_plato, id_ingrediente, cantidad) VALUES (?, ?, ?)";

        try (Connection con = ConexionBD.getConnection()) {

            con.setAutoCommit(false);

            try {
                // Verificar que exista el plato.
                try (PreparedStatement ps = con.prepareStatement(sqlPlato)) {
                    ps.setInt(1, idPlato);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Verificar que exista el ingrediente.
                try (PreparedStatement ps = con.prepareStatement(sqlIngrediente)) {
                    ps.setInt(1, idIngrediente);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Evitar ingredientes duplicados en la receta.
                try (PreparedStatement ps = con.prepareStatement(sqlDuplicado)) {
                    ps.setInt(1, idPlato);
                    ps.setInt(2, idIngrediente);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Registrar el ingrediente.
                try (PreparedStatement ps = con.prepareStatement(sqlInsertar)) {
                    ps.setInt(1, idPlato);
                    ps.setInt(2, idIngrediente);
                    ps.setDouble(3, cantidad);

                    int filas = ps.executeUpdate();

                    if (filas > 0) {
                        con.commit();
                        return true;
                    }

                    con.rollback();
                    return false;
                }

            } catch (SQLException e) {
                con.rollback();
                throw e;

            } finally {
                con.setAutoCommit(true);
            }

        } catch (SQLException e) {
            System.out.println("Error al registrar ingrediente en receta: " +
                    e.getMessage());
        }

        return false;
    }

    @Override
    public List<PlatoIngrediente> listarPorPlato(int idPlato) {

        List<PlatoIngrediente> lista = new ArrayList<>();

        String sql =
                "SELECT p.id_plato, p.nombre AS nombre_plato, p.precio, " +
                        "i.id_ingrediente, i.nombre AS nombre_ingrediente, " +
                        "i.unidad, i.stock, pi.cantidad " +
                        "FROM plato_ingrediente pi " +
                        "INNER JOIN platos p ON pi.id_plato = p.id_plato " +
                        "INNER JOIN ingredientes i ON pi.id_ingrediente = i.id_ingrediente " +
                        "WHERE pi.id_plato = ? " +
                        "ORDER BY i.nombre";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idPlato);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {

                    Plato plato = new Plato(
                            rs.getInt("id_plato"),
                            rs.getString("nombre_plato"),
                            rs.getDouble("precio")
                    );

                    Ingrediente ingrediente = new Ingrediente(
                            rs.getInt("id_ingrediente"),
                            rs.getString("nombre_ingrediente"),
                            rs.getString("unidad"),
                            rs.getDouble("stock")
                    );

                    PlatoIngrediente relacion = new PlatoIngrediente(
                            plato,
                            ingrediente,
                            rs.getDouble("cantidad")
                    );

                    lista.add(relacion);
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al listar ingredientes de receta: " +
                    e.getMessage());
        }

        return lista;
    }

    @Override
    public boolean actualizarCantidad(
            int idPlato, int idIngrediente, double cantidad) {

        String sqlValidar =
                "SELECT id_plato_ingrediente FROM plato_ingrediente " +
                        "WHERE id_plato = ? AND id_ingrediente = ?";

        String sqlPedidos =
                "SELECT COUNT(*) AS total FROM detalle_pedido dp " +
                        "INNER JOIN pedidos p ON dp.id_pedido = p.id_pedido " +
                        "WHERE dp.id_plato = ? AND p.inventario_descontado = TRUE";

        String sqlActualizar =
                "UPDATE plato_ingrediente SET cantidad = ? " +
                        "WHERE id_plato = ? AND id_ingrediente = ?";

        try (Connection con = ConexionBD.getConnection()) {

            con.setAutoCommit(false);

            try {
                // Verificar que exista la relación.
                try (PreparedStatement ps = con.prepareStatement(sqlValidar)) {
                    ps.setInt(1, idPlato);
                    ps.setInt(2, idIngrediente);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Proteger pedidos con inventario descontado.
                try (PreparedStatement ps = con.prepareStatement(sqlPedidos)) {
                    ps.setInt(1, idPlato);

                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();

                        if (rs.getInt("total") > 0) {
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Actualizar cantidad.
                try (PreparedStatement ps = con.prepareStatement(sqlActualizar)) {
                    ps.setDouble(1, cantidad);
                    ps.setInt(2, idPlato);
                    ps.setInt(3, idIngrediente);

                    int filas = ps.executeUpdate();

                    if (filas > 0) {
                        con.commit();
                        return true;
                    }

                    con.rollback();
                    return false;
                }

            } catch (SQLException e) {
                con.rollback();
                throw e;

            } finally {
                con.setAutoCommit(true);
            }

        } catch (SQLException e) {
            System.out.println("Error al actualizar cantidad: " +
                    e.getMessage());
        }

        return false;
    }

    @Override
    public boolean eliminar(int idPlato, int idIngrediente) {

        String sqlValidar = "SELECT id_plato_ingrediente FROM plato_ingrediente WHERE id_plato = ? AND id_ingrediente = ?";

        String sqlPedidos = "SELECT COUNT(*) AS total FROM detalle_pedido dp INNER JOIN pedidos p ON dp.id_pedido = p.id_pedido " + "WHERE dp.id_plato = ? AND p.inventario_descontado = TRUE";

        String sqlExclusiones = "SELECT COUNT(*) AS total FROM detalle_pedido dp  JOIN detalle_ingrediente_excluido de " +
                        "ON dp.id_detalle = de.id_detalle WHERE dp.id_plato = ? AND de.id_ingrediente = ?";

        String sqlEliminar = "DELETE FROM plato_ingrediente WHERE id_plato = ? AND id_ingrediente = ?";

        try (Connection con = ConexionBD.getConnection()) {

            con.setAutoCommit(false);

            try {
                // Verificar que exista la relación.
                try (PreparedStatement ps = con.prepareStatement(sqlValidar)) {
                    ps.setInt(1, idPlato);
                    ps.setInt(2, idIngrediente);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Verificar pedidos con inventario descontado.
                try (PreparedStatement ps = con.prepareStatement(sqlPedidos)) {
                    ps.setInt(1, idPlato);

                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();

                        if (rs.getInt("total") > 0) {
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Verificar personalizaciones de pedidos.
                try (PreparedStatement ps = con.prepareStatement(sqlExclusiones)) {
                    ps.setInt(1, idPlato);
                    ps.setInt(2, idIngrediente);

                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();

                        if (rs.getInt("total") > 0) {
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Eliminar ingrediente de la receta.
                try (PreparedStatement ps = con.prepareStatement(sqlEliminar)) {
                    ps.setInt(1, idPlato);
                    ps.setInt(2, idIngrediente);

                    int filas = ps.executeUpdate();

                    if (filas > 0) {
                        con.commit();
                        return true;
                    }

                    con.rollback();
                    return false;
                }

            } catch (SQLException e) {
                con.rollback();
                throw e;

            } finally {
                con.setAutoCommit(true);
            }

        } catch (SQLException e) {
            System.out.println("Error al eliminar ingrediente de receta: " +
                    e.getMessage());
        }

        return false;
    }
}
