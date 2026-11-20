package modelo;

public class DetallePedido {

    protected int id;
    protected Pedido pedido;
    protected Plato plato;
    protected int cantidad;
    protected double precio;
    protected String observacion;

    public DetallePedido(int id, Pedido pedido, Plato plato,
                         int cantidad, double precio, String observacion) {
        this.id = id;
        this.pedido = pedido;
        this.plato = plato;
        this.cantidad = cantidad;
        this.precio = precio;
        this.observacion = observacion;
    }

    public double calcularSubtotal() {
        return cantidad * precio;
    }

    public void mostrarInformacion() {
        System.out.println("Detalle: " + id);
        System.out.println("modelo.Plato: " + plato.getNombre());
        System.out.println("Cantidad: " + cantidad);
        System.out.println("Precio:  " + precio);
        System.out.println("Observacion: " + observacion);
        System.out.println("Subtotal:  " + calcularSubtotal());
    }
    public int getId() {
        return id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public Plato getPlato() {
        return plato;
    }

    public int getCantidad() {
        return cantidad;
    }

    public double getPrecio() {
        return precio;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

}
