
package dao;

import modelo.DetallePedido;
import java.util.List;

public interface DetallePedidoDAO {

    int insertar(int idPedido, int idPlato, int cantidad, String observacion);

    List<DetallePedido> listarPorPedido(int idPedido);

    DetallePedido buscarPorId(int idDetalle);

    boolean actualizar(int idDetalle, int cantidad, String observacion);

    boolean eliminar(int idDetalle);

    double calcularTotal(int idPedido);
}
