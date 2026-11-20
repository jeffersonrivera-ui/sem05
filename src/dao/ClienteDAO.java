package dao;

import java.util.List;

import modelo.Cliente;

public interface ClienteDAO {
    int insertar(Cliente cliente);

    List<Cliente> listar();

    Cliente buscarPorId(int id);

    boolean actualizar(Cliente cliente);

    boolean eliminar(int id);

    boolean existe(int id);
}
