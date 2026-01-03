package com.drop.domain.fee.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.fee.dto.CrossfitBoxFeeCreateDto;
import com.drop.domain.fee.dto.CrossfitBoxFeeUpdateDto;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;

@Entity
@Builder
@Getter
@Table(name = "CROSSFIT_BOX_FEE")
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CrossfitBoxFee extends BaseEntity {

    @Id
    @Column(name = "FEE_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CROSSFIT_BOX_ID")
    private CrossfitBox crossfitBox;

    private Long price;
    private Integer frequency;

    public static CrossfitBoxFee create(CrossfitBoxFeeCreateDto crossfitBoxFeeCreateDto, CrossfitBox crossfitBox){
        return CrossfitBoxFee.builder()
                .crossfitBox(crossfitBox)
                .price(crossfitBoxFeeCreateDto.getPrice())
                .frequency(crossfitBoxFeeCreateDto.getFrequency())
                .build();
    }

    public void updateFee(CrossfitBoxFeeUpdateDto crossfitBoxFeeUpdateDto){
        this.price = crossfitBoxFeeUpdateDto.getPrice();
        this.frequency = crossfitBoxFeeUpdateDto.getFrequency();
    }
}
