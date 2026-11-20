package dao.impl;

import conexion.ConexionBD;
import dao.EmpleadoDAO;
import modelo.Empleado;
import modelo.Mesero;
import modelo.Cocinero;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EmpleadoDAOImpl implements EmpleadoDAO {

    // REGISTRAR EMPLEADO
    @Override
    public int insertar(Empleado empleado) {

        String sql = "INSERT INTO empleados (nombres, apellidos, telefono, cargo, direccion, "
                + "dni, contacto_emergencia, correo, distrito, provincia, departamento, codigo_postal, referencia_direccion, salario, turno_laboral, fecha_contratacion, estado_laboral) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, empleado.getNombres());
            ps.setString(2, empleado.getApellidos());
            ps.setString(3, empleado.getTelefono());
            ps.setString(4, empleado.getCargo());
            ps.setString(5, empleado.getDireccion());
            ps.setString(6, empleado.getDni());
            ps.setString(7, empleado.getContactoEmergencia());
            ps.setString(8, empleado.getCorreo());
            ps.setString(9, empleado.getDistrito());
            ps.setString(10, empleado.getProvincia());
            ps.setString(11, empleado.getDepartamento());
            ps.setString(12, empleado.getCodigoPostal());
            ps.setString(13, empleado.getReferenciaDireccion());
            ps.setDouble(14, empleado.getSalario());
            ps.setString(15, empleado.getTurnoLaboral());

            if (empleado.getFechaContratacion() != null) {
                ps.setDate(16, Date.valueOf(empleado.getFechaContratacion()));
            } else {
                ps.setNull(16, java.sql.Types.DATE);
            }

            ps.setString(17, "ACTIVO");

            int filas = ps.executeUpdate();

            if (filas > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al registrar empleado: " + e.getMessage());
        }

        return -1;
    }

    // LISTAR EMPLEADOS
    @Override
    public List<Empleado> listar() {

        List<Empleado> empleados = new ArrayList<>();

        String sql = "SELECT * FROM empleados";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {

                Empleado empleado = crearEmpleado(rs);

                if (empleado != null) {
                    empleados.add(empleado);
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al consultar empleados: " + e.getMessage());
        }

        return empleados;
    }

    // CREAR OBJETO SEGUN EL CARGO
    private Empleado crearEmpleado(ResultSet rs) throws SQLException {

        int id = rs.getInt("id_empleado");

        String nombres = rs.getString("nombres");
        String apellidos = rs.getString("apellidos");
        String telefono = rs.getString("telefono");
        String cargo = rs.getString("cargo");

        String direccion = rs.getString("direccion");
        String dni = rs.getString("dni");
        String contactoEmergencia = rs.getString("contacto_emergencia");
        String correo = rs.getString("correo");

        String distrito = rs.getString("distrito");
        String provincia = rs.getString("provincia");
        String departamento = rs.getString("departamento");
        String codigoPostal = rs.getString("codigo_postal");
        String referenciaDireccion = rs.getString("referencia_direccion");

        double salario = rs.getDouble("salario");
        String turnoLaboral = rs.getString("turno_laboral");

        Date fechaSQL = rs.getDate("fecha_contratacion");

        LocalDate fechaContratacion = null;

        if (fechaSQL != null) {
            fechaContratacion = fechaSQL.toLocalDate();
        }

        String estadoLaboral = rs.getString("estado_laboral");

        if (cargo != null && cargo.equalsIgnoreCase("MESERO")) {

            return new Mesero(id, nombres, telefono, apellidos, direccion, dni, contactoEmergencia, correo, distrito, provincia, departamento, codigoPostal, referenciaDireccion, salario, turnoLaboral, fechaContratacion, estadoLaboral);

        } else if (cargo != null && cargo.equalsIgnoreCase("COCINERO")) {

            return new Cocinero(id, nombres, telefono, apellidos, direccion, dni, contactoEmergencia, correo, distrito, provincia, departamento, codigoPostal, referenciaDireccion, salario, turnoLaboral, fechaContratacion, estadoLaboral);
        }

        System.out.println("Cargo desconocido para el empleado con ID: " + id);

        return null;
    }

    // ACTUALIZAR ESTADO LABORAL
    @Override
    public boolean actualizarEstado(String dni, String estado) {

        String sql = "UPDATE empleados SET estado_laboral = ? WHERE dni = ?";

        try (Connection connection = ConexionBD.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, estado);
            ps.setString(2, dni);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            System.out.println("Error al actualizar estado: " + e.getMessage());
            return false;
        }
    }
}
