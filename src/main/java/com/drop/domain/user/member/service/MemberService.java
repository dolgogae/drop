package com.drop.domain.user.member.service;

import com.drop.domain.user.member.data.Member;
import com.drop.domain.user.member.dto.MemberCreateDto;
import com.drop.domain.user.member.dto.MemberDto;
import com.drop.domain.user.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public MemberDto createMember(MemberCreateDto memberCreateDto){
        Member member = Member.create(memberCreateDto);
        Member savedMember = memberRepository.save(member);

        MemberDto result = modelMapper.map(savedMember, MemberDto.class);
        return result;
    }
}
