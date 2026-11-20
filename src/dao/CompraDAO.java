package dao;

import java.util.List;
import java.util.Map;

public interface CompraDAO {

    int registrarCompra(int idIngrediente, double cantidad, double precioUnitario);

    List<Map<String, Object>> listarCompras();

    List<Map<String, Object>> buscarCompra(int idCompra);
}