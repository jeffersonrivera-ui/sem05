package modelo;

public class Compra {

    protected int id;
    protected String fecha;
    protected double total;

    public Compra(int id, String fecha, double total) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
    }

    public void mostrarInformacion() {
        System.out.println("ID de compra: " + id);
        System.out.println("Fecha: " + fecha);
        System.out.println("Total: S/ " + total);
    }

    public int getId() {
        return id;
    }

    public String getFecha() {
        return fecha;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }
}
