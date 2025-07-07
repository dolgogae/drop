package com.drop.domain.certification.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.user.trainer.data.Trainer;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;

@Entity
@Table(name = "CERTIFICATE")
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Certification extends BaseEntity {

    @Id
    @Column(name = "CERTIFICATE_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    private Trainer trainer;
    private String certificateName;
    private String pictureUrl;
}
