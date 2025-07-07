package com.drop.domain.user.trainer.data;

import com.drop.domain.certification.data.Certification;
import com.drop.domain.fee.data.TrainerFee;
import com.drop.domain.user.trainer.dto.TrainerCreateDto;
import com.drop.domain.user.userbase.data.UserBase;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import javax.persistence.*;
import java.util.List;

@Getter
@Entity
@SuperBuilder
@NoArgsConstructor
@DiscriminatorValue("TRAINER")
public class Trainer extends UserBase {

    @OneToMany(mappedBy = "trainer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certification> certifications;

    private String shortIntroduction;
    private String longIntroduction;

    @OneToMany(mappedBy = "trainer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TrainerFee> trainerFees;

    public static Trainer create(TrainerCreateDto trainerDto){
        return Trainer.builder()
                .username(trainerDto.getUsername())
                .email(trainerDto.getEmail())
                .password(trainerDto.getPassword())
                .role(trainerDto.getRole())
                .shortIntroduction(trainerDto.getShortIntroduction())
                .longIntroduction(trainerDto.getLongIntroduction())
                .build();
    }
}
