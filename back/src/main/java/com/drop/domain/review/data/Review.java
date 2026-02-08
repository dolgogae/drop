package com.drop.domain.review.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.member.data.Member;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "REVIEW")
@EntityListeners(AuditingEntityListener.class)
public class Review extends BaseEntity {

    @Id
    @Column(name = "REVIEW_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CROSSFIT_BOX_ID", nullable = false)
    private CrossfitBox crossfitBox;

    @Column(name = "RATING", nullable = false)
    private Integer rating;

    @Column(name = "CONTENT", length = 1000)
    private String content;

    public static Review create(Member member, CrossfitBox crossfitBox, Integer rating, String content) {
        return Review.builder()
                .member(member)
                .crossfitBox(crossfitBox)
                .rating(rating)
                .content(content)
                .build();
    }

    public void update(Integer rating, String content) {
        this.rating = rating;
        this.content = content;
    }
}
