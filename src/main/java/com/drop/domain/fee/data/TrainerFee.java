package com.drop.domain.fee.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.fee.dto.FeeCreateDto;
import com.drop.domain.fee.dto.FeeUpdateDto;
import com.drop.domain.user.trainer.data.Trainer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;

@Entity
@Builder
@Getter
@Table(name = "TRAINER_FEE")
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class TrainerFee extends BaseEntity {

    @Id
    @Column(name = "FEE_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    private Trainer trainer;

    private Long price;
    private Integer frequency;

    public static TrainerFee create(FeeCreateDto feeCreateDto, Trainer trainer){
        return TrainerFee.builder()
                .trainer(trainer)
                .price(feeCreateDto.getPrice())
                .frequency(feeCreateDto.getFrequency())
                .build();
    }

    public static TrainerFee create(FeeCreateDto feeCreateDto){
        return TrainerFee.builder()
                .price(feeCreateDto.getPrice())
                .frequency(feeCreateDto.getFrequency())
                .build();
    }

    public void updateFee(FeeUpdateDto feeUpdateDto){
        this.price = feeUpdateDto.getPrice();
        this.frequency = feeUpdateDto.getFrequency();
    }
}
