package edu.campus.clinic;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ClinicController {
    @GetMapping("/patients")
    public String patients() { return "[]"; }

    @PostMapping("/appointments")
    public String book() { return "{}"; }

    @GetMapping("/doctors")
    public String doctors() { return "[]"; }
}
