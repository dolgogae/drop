package com.drop.domain.gymsync.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDate;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "INACTIVE_GYM_CANDIDATE")
@EntityListeners(AuditingEntityListener.class)
public class InactiveGymCandidate extends BaseEntity {

    @Id
    @Column(name = "INACTIVE_GYM_CANDIDATE_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CROSSFIT_BOX_ID", nullable = false)
    private CrossfitBox crossfitBox;

    @Column(name = "DETECTED_AT", nullable = false)
    private LocalDate detectedAt;
}
