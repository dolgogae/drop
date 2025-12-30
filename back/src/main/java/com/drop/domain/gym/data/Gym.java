package com.drop.domain.gym.data;

import com.drop.domain.base.Address;
import com.drop.domain.base.BaseEntity;
import com.drop.domain.fee.data.GymFee;
import com.drop.domain.gym.dto.GymCreateDto;
import com.drop.global.enums.UserRole;
import com.drop.global.security.Authenticatable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.util.List;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "GYM")
@EntityListeners(AuditingEntityListener.class)
public class Gym extends BaseEntity implements Authenticatable {

    @Id
    @Column(name = "GYM_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "USERNAME")
    private String username;

    @Column(name = "EMAIL", unique = true, nullable = false)
    private String email;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "ROLE")
    @Enumerated(value = EnumType.STRING)
    @Builder.Default
    private UserRole role = UserRole.GYM;

    @Column(name = "ACCESS_TOKEN", length = 2000)
    private String accessToken;

    @Column(name = "REFRESH_TOKEN", length = 2000)
    private String refreshToken;

    // Gym-specific fields
    private String name;
    private String phoneNumber;
    private String etcInfo;

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

    @Override
    public void setTokens(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public static Gym create(GymCreateDto gymDto) {
        return Gym.builder()
                .username(gymDto.getUsername())
                .email(gymDto.getEmail())
                .password(gymDto.getPassword())
                .role(gymDto.getRole() != null ? gymDto.getRole() : UserRole.GYM)
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
    public static class UsageInfo {
        private Boolean parking;
        private Boolean wear;
        private Boolean locker;

        public static UsageInfo create(GymCreateDto.GymUsageInfoDto usageInfoDto) {
            if (usageInfoDto == null) {
                return UsageInfo.builder().build();
            }
            return UsageInfo.builder()
                    .locker(usageInfoDto.getLocker())
                    .parking(usageInfoDto.getParking())
                    .wear(usageInfoDto.getWear())
                    .build();
        }
    }
}
