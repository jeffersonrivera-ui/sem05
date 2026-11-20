package modelo;

public class Bebida extends ProductoMenu {
    public Bebida(int id, String nombre, double precio){
        super(id,nombre,precio);
    }
    @Override
    public void mostrarTipo(){
        System.out.println("Tipo de productos: modelo.Bebida");
    }
}
