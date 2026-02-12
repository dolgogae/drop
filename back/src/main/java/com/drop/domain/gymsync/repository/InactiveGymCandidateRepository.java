package com.drop.domain.gymsync.repository;

import com.drop.domain.gymsync.data.InactiveGymCandidate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InactiveGymCandidateRepository extends JpaRepository<InactiveGymCandidate, Long> {

    boolean existsByCrossfitBoxId(Long crossfitBoxId);
}
