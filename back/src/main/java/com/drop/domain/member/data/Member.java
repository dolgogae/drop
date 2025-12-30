package com.drop.domain.member.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.member.dto.MemberCreateDto;
import com.drop.global.enums.UserRole;
import com.drop.global.security.Authenticatable;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
@Table(name = "MEMBER")
@EntityListeners(AuditingEntityListener.class)
public class Member extends BaseEntity implements Authenticatable {

    @Id
    @Column(name = "MEMBER_ID")
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
    private UserRole role = UserRole.MEMBER;

    @Column(name = "ACCESS_TOKEN", length = 2000)
    private String accessToken;

    @Column(name = "REFRESH_TOKEN", length = 2000)
    private String refreshToken;

    // Member-specific fields
    private String exampleColumn;

    @Override
    public void setTokens(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public static Member create(MemberCreateDto memberCreateDto) {
        return Member.builder()
                .username(memberCreateDto.getUsername())
                .email(memberCreateDto.getEmail())
                .password(memberCreateDto.getPassword())
                .role(memberCreateDto.getRole() != null ? memberCreateDto.getRole() : UserRole.MEMBER)
                .exampleColumn(memberCreateDto.getExampleColumn())
                .build();
    }
}
