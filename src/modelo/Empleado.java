package modelo;

import java.time.LocalDate;

public abstract class Empleado extends Persona {

    protected String cargo;
    protected String direccion;
    protected String dni;
    protected String contactoEmergencia;
    protected String correo;
    protected String estadoLaboral = "ACTIVO";
    protected String distrito;
    protected String provincia;
    protected String departamento;
    protected String codigoPostal;
    protected String referenciaDireccion;
    protected double salario;
    protected String turnoLaboral;
    protected LocalDate fechaContratacion;

    public Empleado(int id, String nombres, String telefono, String apellidos, String cargo, String direccion, String dni,
            String contactoEmergencia, String correo, String distrito, String provincia,
            String departamento, String codigoPostal, String referenciaDireccion, double salario, String turnoLaboral, LocalDate fechaContratacion, String estadoLaboral) {

        super(id, nombres, telefono, apellidos);

        this.cargo = cargo;
        this.direccion = direccion;
        this.dni = dni;
        this.contactoEmergencia = contactoEmergencia;
        this.correo = correo;
        this.distrito = distrito;
        this.provincia = provincia;
        this.departamento = departamento;
        this.codigoPostal = codigoPostal;
        this.referenciaDireccion = referenciaDireccion;
        this.salario = salario;
        this.turnoLaboral = turnoLaboral;
        this.fechaContratacion = fechaContratacion;
        this.estadoLaboral = estadoLaboral;
    }


    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getContactoEmergencia() {
        return contactoEmergencia;
    }

    public void setContactoEmergencia(String contactoEmergencia) {
        this.contactoEmergencia = contactoEmergencia;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getEstadoLaboral() {
        return estadoLaboral;
    }

    public void setEstadoLaboral(String estadoLaboral) {
        this.estadoLaboral = estadoLaboral;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }


    public String getDistrito() {
        return distrito;
    }

    public void setDistrito(String distrito) {
        this.distrito = distrito;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    public String getReferenciaDireccion() {
        return referenciaDireccion;
    }

    public void setReferenciaDireccion(String referenciaDireccion) {
        this.referenciaDireccion = referenciaDireccion;
    }

    public double getSalario() {
        return salario;
    }

    public void setSalario(double salario) {
        this.salario = salario;
    }

    public String getTurnoLaboral() {
        return turnoLaboral;
    }

    public void setTurnoLaboral(String turnoLaboral) {
        this.turnoLaboral = turnoLaboral;
    }

    public LocalDate getFechaContratacion() {
        return fechaContratacion;
    }

    public void setFechaContratacion(LocalDate fechaContratacion) {
        this.fechaContratacion = fechaContratacion;
    }

    public void mostrarCargo() {
        System.out.println("Cargo: " + cargo);
    }

    @Override
    public void mostrarInformacion() {
        super.mostrarInformacion();

        System.out.println("========== DATOS DEL EMPLEADO ==========");
        System.out.println("Cargo: " + cargo);
        System.out.println("Direccion: " + direccion);
        System.out.println("Distrito: " + distrito);
        System.out.println("Provincia: " + provincia);
        System.out.println("Departamento: " + departamento);
        System.out.println("Codigo postal: " + codigoPostal);
        System.out.println("Referencia: " + referenciaDireccion);
        System.out.println("DNI: " + dni);
        System.out.println("Contacto de emergencia: " + contactoEmergencia);
        System.out.println("Correo: " + correo);
        System.out.println("Salario: S/ " + salario);
        System.out.println("Turno laboral: " + turnoLaboral);
        System.out.println("Fecha de contratacion: " + fechaContratacion);
        System.out.println("Estado laboral: " + estadoLaboral);
        System.out.println("========================================");
    }

    // Método abstracto
    public abstract void realizarFuncion();
}
