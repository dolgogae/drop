package com.drop.domain.crossfitbox.data;

import com.drop.domain.base.Address;
import com.drop.domain.base.BaseEntity;
import com.drop.domain.fee.data.CrossfitBoxFee;
import com.drop.domain.crossfitbox.dto.CrossfitBoxCreateDto;
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
@Table(name = "CROSSFIT_BOX")
@EntityListeners(AuditingEntityListener.class)
public class CrossfitBox extends BaseEntity implements Authenticatable {

    @Id
    @Column(name = "CROSSFIT_BOX_ID")
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

    // CrossfitBox-specific fields
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

    @OneToMany(mappedBy = "crossfitBox", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CrossfitBoxFee> crossfitBoxFees;

    @Override
    public void setTokens(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public static CrossfitBox create(CrossfitBoxCreateDto crossfitBoxDto) {
        return CrossfitBox.builder()
                .username(crossfitBoxDto.getUsername())
                .email(crossfitBoxDto.getEmail())
                .password(crossfitBoxDto.getPassword())
                .role(crossfitBoxDto.getRole() != null ? crossfitBoxDto.getRole() : UserRole.GYM)
                .name(crossfitBoxDto.getName())
                .phoneNumber(crossfitBoxDto.getPhoneNumber())
                .etcInfo(crossfitBoxDto.getEtcInfo())
                .address(Address.create(crossfitBoxDto.getAddress()))
                .usageInfo(UsageInfo.create(crossfitBoxDto.getUsageInfoDto()))
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

        public static UsageInfo create(CrossfitBoxCreateDto.CrossfitBoxUsageInfoDto usageInfoDto) {
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
