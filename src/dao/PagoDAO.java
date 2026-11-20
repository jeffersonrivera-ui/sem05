
package dao;

import java.util.List;
import java.util.Map;

public interface PagoDAO {

    Map<String, Object> registrarPago(int idPedido, double monto, String metodoPago);

    List<Map<String, Object>> listarPagos();

    Map<String, Object> buscarPago(int idPago);
}
