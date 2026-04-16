package com.drop.domain.member.service;

import com.drop.domain.member.data.Member;
import com.drop.domain.member.dto.MemberCreateDto;
import com.drop.domain.member.dto.MemberDto;
import com.drop.domain.member.mapper.MemberMapper;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final MemberMapper memberMapper;

    @Transactional
    public MemberDto createMember(MemberCreateDto memberCreateDto){
        if (memberRepository.existsByEmail(memberCreateDto.getEmail())) {
            throw new BusinessException(ErrorCode.USER_EMAIL_ALREADY_EXISTS);
        }

        Member member = Member.create(memberCreateDto);
        Member savedMember = memberRepository.save(member);

        return memberMapper.toDto(savedMember);
    }
}
