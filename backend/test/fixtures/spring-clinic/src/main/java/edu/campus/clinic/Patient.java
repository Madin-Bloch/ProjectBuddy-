package edu.campus.clinic;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;

@Entity
@Table(name = "patients")
public class Patient {
    @Id
    public Long id;
    public String name;
}
