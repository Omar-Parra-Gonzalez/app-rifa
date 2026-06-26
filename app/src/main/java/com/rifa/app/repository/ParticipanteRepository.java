package com.rifa.app.repository;

import com.rifa.app.model.Participante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParticipanteRepository extends JpaRepository<Participante, Integer> {

    @Query("SELECT p.numeroBoleta FROM Participante p")
    List<String> findAllNumeroBoletas();

    List<Participante> findByTelefono(String telefono);
}