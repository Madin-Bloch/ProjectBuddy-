package edu.campus.clinic;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    public Long id;
    public Long patientId;
    public String slot;
}
