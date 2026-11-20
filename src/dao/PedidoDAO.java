
package dao;

import modelo.Pedido;
import java.util.List;

public interface PedidoDAO {
    int insertar(int idCliente, int idMesero);
    List<Pedido> listar();
    Pedido buscarPorId(int id);
    boolean actualizarEstado(int id, String estado);
    boolean eliminar(int id);
    Boolean existe(int id);
}
