
package controlador;

import dao.ClienteDAO;
import dao.impl.ClienteDAOImpl;
import java.util.List;
import modelo.Cliente;

public class ClienteOperaciones {

    // Conexión con la interfaz DAO
    private static final ClienteDAO clienteDAO = new ClienteDAOImpl();

    // ==========================================
    // REGISTRAR CLIENTE
    // ==========================================

    public static void registrarCliente(
            String nombres, String apellidos, String telefono) {

        if (nombres == null || nombres.trim().isEmpty() || apellidos == null || apellidos.trim().isEmpty()) {

            System.out.println("Los nombres y apellidos son obligatorios.");
            return;
        }

        Cliente cliente = new Cliente(0, nombres.trim(), telefono, apellidos.trim());

        int id = clienteDAO.insertar(cliente);

        if (id > 0) {
            System.out.println("Cliente registrado correctamente.");
            System.out.println("ID generado: " + id);
        } else {
            System.out.println("No se pudo registrar el cliente.");
        }
    }

    // ==========================================
    // LISTAR CLIENTES
    // ==========================================

    public static void listarClientes() {
        List<Cliente> clientes = clienteDAO.listar();

        if (clientes == null || clientes.isEmpty()) {

            System.out.println("No hay clientes registrados.");

        } else {

            for (Cliente cliente : clientes) {

                cliente.mostrarInformacion();
                System.out.println("-------------------------");
            }
        }
    }

    // ==========================================
    // BUSCAR CLIENTE
    // ==========================================

    public static void buscarCliente(int id) {
        Cliente cliente = clienteDAO.buscarPorId(id);

        if (cliente != null) {

            cliente.mostrarInformacion();

        } else {

            System.out.println("No se encontro el cliente.");
        }
    }

    // ==========================================
    // ACTUALIZAR CLIENTE
    // ==========================================

    public static void actualizarCliente(int id, String nombres, String apellidos, String telefono) {

        if (nombres == null || nombres.trim().isEmpty() || apellidos == null || apellidos.trim().isEmpty()) {

            System.out.println(
                    "Los nombres y apellidos son obligatorios.");
            return;
        }

        // Primero buscamos el cliente
        Cliente cliente = clienteDAO.buscarPorId(id);

        if (cliente == null) {

            System.out.println("No se encontro el cliente.");
            return;
        }

        // Modificamos sus atributos
        cliente.setNombres(nombres.trim());
        cliente.setApellidos(apellidos.trim());
        cliente.setTelefono(telefono);

        // Enviamos el objeto actualizado al DAO
        if (clienteDAO.actualizar(cliente)) {

            System.out.println("Cliente actualizado correctamente.");

        } else {

            System.out.println("No se pudo actualizar el cliente.");
        }
    }

    // ==========================================
    // ELIMINAR CLIENTE
    // ==========================================

    public static void eliminarCliente(int id) {

        if (clienteDAO.eliminar(id)) {

            System.out.println("Cliente eliminado correctamente.");

        } else {

            System.out.println("No se pudo eliminar el cliente. " + "Verifique si tiene pedidos relacionados.");
        }
    }

    // ==========================================
    // VERIFICAR SI EXISTE CLIENTE
    // ==========================================

    public static boolean existeCliente(int id) {

        return clienteDAO.existe(id);
    }
}

