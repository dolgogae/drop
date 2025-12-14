package com.drop.domain.user.member.data;

import com.drop.domain.user.member.dto.MemberCreateDto;
import com.drop.domain.user.userbase.data.UserBase;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Getter
@Entity
@NoArgsConstructor
@SuperBuilder
@DiscriminatorValue("MEMBER")
public class Member extends UserBase {

    private String exampleColumn;

    public static Member create(MemberCreateDto memberCreateDto){
        return Member.builder()
                .username(memberCreateDto.getUsername())
                .email(memberCreateDto.getEmail())
                .password(memberCreateDto.getPassword())
                .role(memberCreateDto.getRole())
                .exampleColumn(memberCreateDto.getExampleColumn())
                .build();
    }
}
