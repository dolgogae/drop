package com.drop.domain.membergym.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.gym.data.Gym;
import com.drop.domain.member.data.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "MEMBER_GYM", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"MEMBER_ID", "GYM_ID"})
})
public class MemberGym extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MEMBER_GYM_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GYM_ID", nullable = false)
    private Gym gym;

    @Column(name = "IS_FAVORITE")
    @Builder.Default
    private Boolean isFavorite = false;

    public static MemberGym create(Member member, Gym gym, Boolean isFavorite) {
        return MemberGym.builder()
                .member(member)
                .gym(gym)
                .isFavorite(isFavorite != null ? isFavorite : false)
                .build();
    }

    public void toggleFavorite() {
        this.isFavorite = !this.isFavorite;
    }

    public void setFavorite(Boolean isFavorite) {
        this.isFavorite = isFavorite;
    }
}
