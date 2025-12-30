package com.drop.domain.member.mapper;

import com.drop.domain.member.data.Member;
import com.drop.domain.member.dto.MemberDto;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface MemberMapper {
    MemberMapper INSTANCE = Mappers.getMapper(MemberMapper.class);

    MemberDto toDto(Member member);
}
