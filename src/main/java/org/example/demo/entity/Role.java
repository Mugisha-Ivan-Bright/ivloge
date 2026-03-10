package org.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false, length = 20)
    private ERole name;

    public Role() {}

    public Role(ERole name) {
        this.name = name;
    }

    public static RoleBuilder builder() {
        return new RoleBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ERole getName() { return name; }
    public void setName(ERole name) { this.name = name; }

    public static class RoleBuilder {
        private ERole name;
        public RoleBuilder name(ERole name) { this.name = name; return this; }
        public Role build() { return new Role(name); }
    }
}
