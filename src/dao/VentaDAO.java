
package dao;

import java.util.List;
import java.util.Map;

public interface VentaDAO {

    Map<String, Object> registrarVenta(int idPedido);

    List<Map<String, Object>> listarVentas();

    Map<String, Object> buscarVenta(int idVenta);
}

