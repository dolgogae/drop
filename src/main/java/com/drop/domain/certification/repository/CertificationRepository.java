package com.drop.domain.certification.repository;

import com.drop.domain.certification.data.Certification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
}
