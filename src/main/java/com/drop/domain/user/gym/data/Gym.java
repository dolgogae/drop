package com.drop.domain.user.gym.data;

import com.drop.domain.fee.data.TrainerFee;
import com.drop.domain.user.gym.dto.GymCreateDto;
import com.drop.domain.user.userbase.data.UserBase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import javax.persistence.*;
import java.util.List;

@Getter
@Entity
@NoArgsConstructor
@SuperBuilder
@DiscriminatorValue("GYM")
public class Gym extends UserBase {
    private String location;
    private String phoneNumber;
    private String etcInfo;    // nearby any stations

    @Embedded
    private UsageInfo usageInfo;

    @OneToMany(mappedBy = "trainer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TrainerFee> trainerFees;

    public static Gym create(GymCreateDto gymDto){
        return Gym.builder()
                .username(gymDto.getUsername())
                .email(gymDto.getEmail())
                .password(gymDto.getPassword())
                .role(gymDto.getRole())
                .location(gymDto.getLocation())
                .phoneNumber(gymDto.getPhoneNumber())
                .etcInfo(gymDto.getEtcInfo())
                .usageInfo(UsageInfo.create(gymDto.getUsageInfoDto()))
                .build();
    }

    @Embeddable
    @Getter
    @NoArgsConstructor
    @Builder
    @AllArgsConstructor
    public static class UsageInfo{
        private Boolean parking;
        private Boolean wear;
        private Boolean locker;

        public static UsageInfo create(GymCreateDto.GymUsageInfoDto usageInfoDto){
            return UsageInfo.builder()
                    .locker(usageInfoDto.getLocker())
                    .parking(usageInfoDto.getParking())
                    .wear(usageInfoDto.getWear())
                    .build();
        }
    }
}
