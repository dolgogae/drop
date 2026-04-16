package com.drop.unit.domain.member.service;

import com.drop.domain.member.data.Member;
import com.drop.domain.member.dto.MemberCreateDto;
import com.drop.domain.member.dto.MemberDto;
import com.drop.domain.member.mapper.MemberMapper;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.member.service.MemberService;
import com.drop.global.code.error.exception.BusinessException;
import com.drop.global.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private MemberMapper memberMapper;

    @InjectMocks
    private MemberService memberService;

    @Test
    @DisplayName("일반 회원 생성 - 중복 이메일이면 예외")
    void createMember_duplicateEmail() {
        // given
        MemberCreateDto dto = MemberCreateDto.builder()
                .username("member")
                .email("member@email.com")
                .password("password123!")
                .role(UserRole.MEMBER)
                .build();

        when(memberRepository.existsByEmail(dto.getEmail())).thenReturn(true);

        // when & then
        assertThatThrownBy(() -> memberService.createMember(dto))
                .isInstanceOf(BusinessException.class);
        verify(memberRepository, never()).save(any(Member.class));
    }

    @Test
    @DisplayName("일반 회원 생성 - 정상 저장")
    void createMember_success() {
        // given
        MemberCreateDto dto = MemberCreateDto.builder()
                .username("member")
                .email("member@email.com")
                .password("password123!")
                .role(UserRole.MEMBER)
                .build();

        Member savedMember = Member.builder()
                .id(1L)
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .role(UserRole.MEMBER)
                .build();

        MemberDto memberDto = MemberDto.builder()
                .id(1L)
                .username(dto.getUsername())
                .email(dto.getEmail())
                .role(UserRole.MEMBER)
                .build();

        when(memberRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(memberRepository.save(any(Member.class))).thenReturn(savedMember);
        when(memberMapper.toDto(savedMember)).thenReturn(memberDto);

        // when
        MemberDto result = memberService.createMember(dto);

        // then
        assertThat(result.getEmail()).isEqualTo(dto.getEmail());
        verify(memberRepository).save(any(Member.class));
    }
}
