package modelo;

public class DetalleCompra {

    protected int id;
    protected Compra compra;
    protected Ingrediente ingrediente;
    protected double cantidad;
    protected double precioUnitario;

    public DetalleCompra(int id, Compra compra,
                         Ingrediente ingrediente,
                         double cantidad, double precioUnitario) {

        this.id = id;
        this.compra = compra;
        this.ingrediente = ingrediente;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
    }

    public double calcularSubtotal() {
        return cantidad * precioUnitario;
    }

    public void mostrarInformacion() {

        System.out.println("ID detalle: " + id);
        System.out.println("Ingrediente: " + ingrediente.getNombre());
        System.out.println("Cantidad: " + cantidad + " " +
                ingrediente.getUnidad());
        System.out.println("Precio unitario: S/ " + precioUnitario);
        System.out.println("Subtotal: S/ " + calcularSubtotal());
    }

    public int getId() {
        return id;
    }

    public Compra getCompra() {
        return compra;
    }

    public Ingrediente getIngrediente() {
        return ingrediente;
    }

    public double getCantidad() {
        return cantidad;
    }

    public double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setCantidad(double cantidad) {
        this.cantidad = cantidad;
    }

    public void setPrecioUnitario(double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
}
