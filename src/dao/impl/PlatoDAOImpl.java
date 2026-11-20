package dao.impl;

import conexion.ConexionBD;
import dao.PlatoDAO;
import modelo.Plato;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PlatoDAOImpl implements PlatoDAO {

    @Override
    public int insertar(Plato plato) {

        String sql = "INSERT INTO platos (nombre, precio, activo) VALUES (?, ?, FALSE)";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, plato.getNombre());
            ps.setDouble(2, plato.getPrecio());

            int filas = ps.executeUpdate();

            if (filas > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {

                    if (rs.next()) {

                        return rs.getInt(1);
                    }
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al registrar plato: " + e.getMessage());
        }

        return 0;
    }

    @Override
    public List<Plato> listar() {

        List<Plato> lista = new ArrayList<>();

        String sql = "SELECT id_plato, nombre, precio FROM platos ORDER BY id_plato";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {

                Plato plato = new Plato(
                        rs.getInt("id_plato"),
                        rs.getString("nombre"),
                        rs.getDouble("precio")
                );

                lista.add(plato);
            }

        } catch (SQLException e) {
            System.out.println("Error al listar platos: " + e.getMessage());
        }

        return lista;
    }

    @Override
    public Plato buscarPorId(int id) {

        String sql = "SELECT id_plato, nombre, precio FROM platos WHERE id_plato = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {

                    return new Plato(
                            rs.getInt("id_plato"),
                            rs.getString("nombre"),
                            rs.getDouble("precio")
                    );
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al buscar plato: " + e.getMessage());
        }

        return null;
    }

    @Override
    public boolean actualizar(Plato plato) {

        String sql = "UPDATE platos SET nombre = ?, precio = ? WHERE id_plato = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, plato.getNombre());
            ps.setDouble(2, plato.getPrecio());
            ps.setInt(3, plato.getId());

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            System.out.println("Error al actualizar plato: " + e.getMessage());
        }

        return false;
    }

    @Override
    public boolean eliminar(int id) {

        String sqlReceta = "SELECT COUNT(*) FROM plato_ingrediente WHERE id_plato = ?";

        String sqlPedidos = "SELECT COUNT(*) FROM detalle_pedido WHERE id_plato = ?";

        String sqlEliminar = "DELETE FROM platos WHERE id_plato = ?";

        try (Connection con = ConexionBD.getConnection()) {

            con.setAutoCommit(false);

            try {

                // Verificar si el plato tiene una receta.
                try (PreparedStatement ps = con.prepareStatement(sqlReceta)) {

                    ps.setInt(1, id);

                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();

                        if (rs.getInt(1) > 0) {
                            System.out.println("No se puede eliminar el plato porque tiene una receta.");
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Verificar si el plato aparece en pedidos.
                try (PreparedStatement ps = con.prepareStatement(sqlPedidos)) {

                    ps.setInt(1, id);

                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();

                        if (rs.getInt(1) > 0) {
                            System.out.println("No se puede eliminar el plato porque aparece en pedidos.");
                            con.rollback();
                            return false;
                        }
                    }
                }

                // Eliminar el plato.
                try (PreparedStatement ps = con.prepareStatement(sqlEliminar)) {

                    ps.setInt(1, id);

                    int filas = ps.executeUpdate();

                    if (filas > 0) {
                        con.commit();
                        return true;
                    } else {
                        con.rollback();
                        return false;
                    }
                }

            } catch (SQLException e) {
                con.rollback();
                throw e;

            } finally {
                con.setAutoCommit(true);
            }

        } catch (SQLException e) {
            System.out.println("Error al eliminar plato: " + e.getMessage());
        }

        return false;
    }

    @Override
    public Boolean existe(int id) {

        String sql = "SELECT id_plato FROM platos WHERE id_plato = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }

        } catch (SQLException e) {
            System.out.println("Error al verificar plato: " + e.getMessage());
        }

        return null;
    }

    @Override
    public void actualizarDisponibilidad() {

        String sql = "UPDATE platos SET activo = CASE WHEN EXISTS ( SELECT 1 FROM plato_ingrediente pi WHERE pi.id_plato = platos.id_plato ) AND NOT EXISTS ( SELECT 1 FROM plato_ingrediente pi INNER JOIN ingredientes i " +
                "ON pi.id_ingrediente = i.id_ingrediente WHERE pi.id_plato = platos.id_plato AND i.stock < pi.cantidad ) THEN TRUE ELSE FALSE END";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.executeUpdate();

            System.out.println("Disponibilidad de platos actualizada correctamente.");

        } catch (SQLException e) {
            System.out.println("Error al actualizar disponibilidad: " + e.getMessage());
        }
    }
    @Override
    public String obtenerEstado(int id) {

        String sql = "SELECT activo FROM platos WHERE id_plato = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return rs.getBoolean("activo") ? "ACTIVO" : "INACTIVO";
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al consultar estado: " + e.getMessage());
        }

        return "DESCONOCIDO";
    }
}
