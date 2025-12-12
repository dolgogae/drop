package com.drop.domain.place.data;

import com.drop.domain.base.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import javax.persistence.*;

@Entity
@Table(
    name = "registered_gym",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "kakao_place_id"})
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RegisteredGym extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "kakao_place_id", nullable = false)
    private String kakaoPlaceId;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "address")
    private String address;

    @Column(name = "road_address")
    private String roadAddress;

    @Column(name = "phone")
    private String phone;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "place_url")
    private String placeUrl;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "tags")
    private String tags;

    @Column(name = "is_favorite")
    private Boolean isFavorite;

    public void updateNote(String note) {
        this.note = note;
    }

    public void updateTags(String tags) {
        this.tags = tags;
    }

    public void toggleFavorite() {
        this.isFavorite = !this.isFavorite;
    }
}
