package com.drop.domain.fee.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.fee.dto.GymFeeCreateDto;
import com.drop.domain.fee.dto.GymFeeUpdateDto;
import com.drop.domain.gym.data.Gym;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;

@Entity
@Builder
@Getter
@Table(name = "GYM_FEE")
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class GymFee extends BaseEntity {

    @Id
    @Column(name = "FEE_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GYM_ID")
    private Gym gym;

    private Long price;
    private Integer frequency;

    public static GymFee create(GymFeeCreateDto gymFeeCreateDto, Gym gym){
        return GymFee.builder()
                .gym(gym)
                .price(gymFeeCreateDto.getPrice())
                .frequency(gymFeeCreateDto.getFrequency())
                .build();
    }

    public void updateFee(GymFeeUpdateDto gymFeeUpdateDto){
        this.price = gymFeeUpdateDto.getPrice();
        this.frequency = gymFeeUpdateDto.getFrequency();
    }
}
