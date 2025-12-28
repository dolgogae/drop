package com.drop.domain.user.gym.data;

import com.drop.domain.base.Address;
import com.drop.domain.fee.data.GymFee;
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
    private String name;
    private String phoneNumber;
    private String etcInfo;    // nearby any stations

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "countryCode", column = @Column(name = "addr_country_code")),
            @AttributeOverride(name = "postalCode", column = @Column(name = "addr_postal_code")),
            @AttributeOverride(name = "addressLine1", column = @Column(name = "addr_line1")),
            @AttributeOverride(name = "addressLine2", column = @Column(name = "addr_line2")),
            @AttributeOverride(name = "jibunAddress", column = @Column(name = "addr_jibun")),
            @AttributeOverride(name = "buildingName", column = @Column(name = "addr_building_name")),
            @AttributeOverride(name = "addressSource", column = @Column(name = "addr_source"))
    })
    private Address address;

    private Double latitude;
    private Double longitude;

    @Embedded
    private UsageInfo usageInfo;

    @OneToMany(mappedBy = "gym", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<GymFee> gymFees;

    public static Gym create(GymCreateDto gymDto){
        return Gym.builder()
                .username(gymDto.getUsername())
                .email(gymDto.getEmail())
                .password(gymDto.getPassword())
                .role(gymDto.getRole())
                .name(gymDto.getName())
                .phoneNumber(gymDto.getPhoneNumber())
                .etcInfo(gymDto.getEtcInfo())
                .address(Address.create(gymDto.getAddress()))
                .usageInfo(UsageInfo.create(gymDto.getUsageInfoDto()))
                .build();
    }

    public void updateAddress(Address address) {
        this.address = address;
    }

    public void updateCoordinates(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
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
