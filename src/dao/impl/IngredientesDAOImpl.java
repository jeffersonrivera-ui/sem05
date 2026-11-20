
package dao.impl;

import conexion.ConexionBD;
import dao.IngredientesDAO;
import modelo.Ingrediente;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class IngredientesDAOImpl implements IngredientesDAO {

    @Override
    public int insertar(Ingrediente ingrediente) {

        String sql = "INSERT INTO ingredientes (nombre, unidad, stock) VALUES (?, ?, ?)";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, ingrediente.getNombre());
            ps.setString(2, ingrediente.getUnidad());
            ps.setDouble(3, ingrediente.getStock());

            int filas = ps.executeUpdate();

            if (filas > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al registrar ingrediente: " + e.getMessage());
        }

        return -1;
    }

    @Override
    public List<Ingrediente> listar() {

        List<Ingrediente> ingredientes = new ArrayList<>();

        String sql = "SELECT * FROM ingredientes ORDER BY nombre";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Ingrediente ingrediente = new Ingrediente(
                        rs.getInt("id_ingrediente"),
                        rs.getString("nombre"),
                        rs.getString("unidad"),
                        rs.getDouble("stock")
                );

                ingredientes.add(ingrediente);
            }

        } catch (SQLException e) {
            System.out.println("Error al listar ingredientes: " + e.getMessage());
        }

        return ingredientes;
    }

    @Override
    public Ingrediente buscarPorId(int id) {

        String sql = "SELECT * FROM ingredientes WHERE id_ingrediente = ?";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Ingrediente(
                            rs.getInt("id_ingrediente"),
                            rs.getString("nombre"),
                            rs.getString("unidad"),
                            rs.getDouble("stock")
                    );
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al buscar ingrediente: " + e.getMessage());
        }

        return null;
    }

    @Override
    public boolean actualizar(Ingrediente ingrediente) {

        String sqlBloquear = "SELECT unidad FROM ingredientes WHERE id_ingrediente = ? FOR UPDATE";

        String sqlReceta = "SELECT COUNT(*) FROM plato_ingrediente WHERE id_ingrediente = ?";

        String sqlActualizar = "UPDATE ingredientes SET nombre = ?, unidad = ?, stock = ? WHERE id_ingrediente = ?";

        try (Connection connection = ConexionBD.getConnection()) {

            connection.setAutoCommit(false);

            try {
                String unidadActual;

                try (PreparedStatement ps = connection.prepareStatement(sqlBloquear)) {
                    ps.setInt(1, ingrediente.getId());

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            connection.rollback();
                            return false;
                        }

                        unidadActual = rs.getString("unidad");
                    }
                }

                int totalRecetas;

                try (PreparedStatement ps = connection.prepareStatement(sqlReceta)) {
                    ps.setInt(1, ingrediente.getId());

                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();
                        totalRecetas = rs.getInt(1);
                    }
                }

                if (totalRecetas > 0 && !unidadActual.equalsIgnoreCase(ingrediente.getUnidad())) {

                    System.out.println("No se puede cambiar la unidad porque el ingrediente " + "pertenece a una o varias recetas.");

                    connection.rollback();
                    return false;
                }

                int filas;

                try (PreparedStatement ps = connection.prepareStatement(sqlActualizar)) {
                    ps.setString(1, ingrediente.getNombre());
                    ps.setString(2, ingrediente.getUnidad());
                    ps.setDouble(3, ingrediente.getStock());
                    ps.setInt(4, ingrediente.getId());

                    filas = ps.executeUpdate();
                }

                if (filas > 0) {
                    connection.commit();
                    return true;
                }

                connection.rollback();
                return false;

            } catch (SQLException e) {
                connection.rollback();
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }

        } catch (SQLException e) {
            System.out.println("Error al actualizar ingrediente: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean eliminar(int id) {

        String sqlBloquear = "SELECT id_ingrediente FROM ingredientes WHERE id_ingrediente = ? FOR UPDATE";

        String sqlReceta = "SELECT COUNT(*) FROM plato_ingrediente WHERE id_ingrediente = ?";

        String sqlCompra = "SELECT COUNT(*) FROM detalle_compra WHERE id_ingrediente = ?";

        String sqlEliminar = "DELETE FROM ingredientes WHERE id_ingrediente = ?";

        try (Connection connection = ConexionBD.getConnection()) {

            connection.setAutoCommit(false);

            try {
                // Verificar que exista el ingrediente.
                try (PreparedStatement ps = connection.prepareStatement(sqlBloquear)) {
                    ps.setInt(1, id);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            connection.rollback();
                            return false;
                        }
                    }
                }

                // Verificar si pertenece a una receta.
                try (PreparedStatement ps = connection.prepareStatement(sqlReceta)) {
                    ps.setInt(1, id);

                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();

                        if (rs.getInt(1) > 0) {
                            System.out.println("No se puede eliminar el ingrediente porque " + "pertenece a una o varias recetas.");

                            connection.rollback();
                            return false;
                        }
                    }
                }

                // Verificar si tiene compras registradas.
                try (PreparedStatement ps = connection.prepareStatement(sqlCompra)) {
                    ps.setInt(1, id);

                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();

                        if (rs.getInt(1) > 0) {
                            System.out.println("No se puede eliminar el ingrediente porque " + "tiene compras registradas en el historial.");

                            connection.rollback();
                            return false;
                        }
                    }
                }

                // Eliminar ingrediente.
                try (PreparedStatement ps = connection.prepareStatement(sqlEliminar)) {
                    ps.setInt(1, id);

                    int filas = ps.executeUpdate();

                    if (filas > 0) {
                        connection.commit();
                        return true;
                    }
                }

                connection.rollback();
                return false;

            } catch (SQLException e) {
                connection.rollback();
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }

        } catch (SQLException e) {
            System.out.println("Error al eliminar ingrediente: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean existe(int id) {

        String sql = "SELECT id_ingrediente FROM ingredientes WHERE id_ingrediente = ?";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }

        } catch (SQLException e) {
            System.out.println("Error al verificar ingrediente: " + e.getMessage());
            return false;
        }
    }
}
