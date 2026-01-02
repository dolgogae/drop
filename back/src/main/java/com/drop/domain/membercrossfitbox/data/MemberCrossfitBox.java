package com.drop.domain.membercrossfitbox.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.crossfitbox.data.CrossfitBox;
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
@Table(name = "MEMBER_CROSSFIT_BOX", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"MEMBER_ID", "CROSSFIT_BOX_ID"})
})
public class MemberCrossfitBox extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MEMBER_CROSSFIT_BOX_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CROSSFIT_BOX_ID", nullable = false)
    private CrossfitBox crossfitBox;

    @Column(name = "IS_FAVORITE")
    @Builder.Default
    private Boolean isFavorite = false;

    public static MemberCrossfitBox create(Member member, CrossfitBox crossfitBox, Boolean isFavorite) {
        return MemberCrossfitBox.builder()
                .member(member)
                .crossfitBox(crossfitBox)
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
