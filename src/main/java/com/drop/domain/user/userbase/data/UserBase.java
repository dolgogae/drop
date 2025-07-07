package com.drop.domain.user.userbase.data;

import com.drop.domain.base.BaseEntity;
import com.drop.global.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;

@Entity
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Table(name = "USER")
@EntityListeners(AuditingEntityListener.class)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
public abstract class UserBase extends BaseEntity {

    @Id
    @Column(name = "USER_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @Column(name = "USERNAME")
    protected String username;

    @Column(name = "EMAIL")
    protected String email;

    @Column(name = "PASSWORD")
    protected String password;

    @Column(name = "ROLE", insertable = false, updatable = false)
    @Enumerated(value = EnumType.STRING)
    protected UserRole role;

    @Column(name = "ACCESS_TOKEN", length = 2000)
    protected String accessToken;

    @Column(name = "REFRESH_TOKEN", length = 2000)
    protected String refreshToken;

    public void setTokens(String accessToken, String refreshToken){
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}

