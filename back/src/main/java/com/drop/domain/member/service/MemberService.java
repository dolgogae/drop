package com.drop.domain.member.service;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.dto.MemberCreateDto;
import com.drop.domain.member.dto.MemberDto;
import com.drop.domain.member.mapper.MemberMapper;
import com.drop.domain.member.repository.MemberRepository;
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
    private final CrossfitBoxRepository crossfitBoxRepository;

    @Transactional
    public MemberDto createMember(MemberCreateDto memberCreateDto){
        Member member = Member.create(memberCreateDto);
        Member savedMember = memberRepository.save(member);

        return memberMapper.toDto(savedMember);
    }

    @Transactional
    public void setHomeBox(Long memberId, Long crossfitBoxId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        if (crossfitBoxId == null) {
            member.updateHomeBox(null);
        } else {
            CrossfitBox crossfitBox = crossfitBoxRepository.findById(crossfitBoxId)
                    .orElseThrow(() -> new IllegalArgumentException("크로스핏박스를 찾을 수 없습니다."));
            member.updateHomeBox(crossfitBox);
        }
    }

    @Transactional(readOnly = true)
    public Long getHomeBoxId(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        return member.getHomeBox() != null ? member.getHomeBox().getId() : null;
    }
}
