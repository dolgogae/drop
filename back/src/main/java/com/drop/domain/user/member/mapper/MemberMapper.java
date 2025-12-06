package com.drop.domain.user.member.mapper;

import com.drop.domain.user.member.data.Member;
import com.drop.domain.user.member.dto.MemberDto;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface MemberMapper {
    MemberMapper INSTANCE = Mappers.getMapper(MemberMapper.class);

    MemberDto toDto(Member member);
}
