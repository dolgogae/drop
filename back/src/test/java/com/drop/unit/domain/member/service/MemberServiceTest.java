package com.drop.unit.domain.member.service;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.dto.MemberCreateDto;
import com.drop.domain.member.dto.MemberDto;
import com.drop.domain.member.mapper.MemberMapper;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.member.service.MemberService;
import com.drop.global.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private MemberMapper memberMapper;

    @Mock
    private CrossfitBoxRepository crossfitBoxRepository;

    @InjectMocks
    private MemberService memberService;

    private Member member;
    private MemberDto memberDto;
    private CrossfitBox crossfitBox;

    @BeforeEach
    void setUp() {
        member = Member.builder()
                .id(1L)
                .username("testUser")
                .email("test@email.com")
                .password("password")
                .role(UserRole.MEMBER)
                .build();

        memberDto = MemberDto.builder()
                .username("testUser")
                .email("test@email.com")
                .role(UserRole.MEMBER)
                .build();

        crossfitBox = CrossfitBox.builder()
                .id(1L)
                .name("Test CrossfitBox")
                .email("box@email.com")
                .build();
    }

    @Test
    @DisplayName("회원 생성 성공")
    void createMember_success() {
        // given
        MemberCreateDto createDto = MemberCreateDto.builder()
                .username("testUser")
                .email("test@email.com")
                .password("password")
                .role(UserRole.MEMBER)
                .build();

        when(memberRepository.save(any(Member.class))).thenReturn(member);
        when(memberMapper.toDto(any(Member.class))).thenReturn(memberDto);

        // when
        MemberDto result = memberService.createMember(createDto);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testUser");
        assertThat(result.getEmail()).isEqualTo("test@email.com");
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    @DisplayName("홈박스 설정 - 성공")
    void setHomeBox_success() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));

        // when
        memberService.setHomeBox(1L, 1L);

        // then
        verify(memberRepository).findById(1L);
        verify(crossfitBoxRepository).findById(1L);
    }

    @Test
    @DisplayName("홈박스 설정 - null로 초기화")
    void setHomeBox_clearHomeBox() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        memberService.setHomeBox(1L, null);

        // then
        verify(memberRepository).findById(1L);
        verify(crossfitBoxRepository, never()).findById(any());
    }

    @Test
    @DisplayName("홈박스 설정 - 회원 없음")
    void setHomeBox_memberNotFound() {
        // given
        when(memberRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> memberService.setHomeBox(999L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("회원을 찾을 수 없습니다");
    }

    @Test
    @DisplayName("홈박스 설정 - 크로스핏박스 없음")
    void setHomeBox_crossfitBoxNotFound() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(crossfitBoxRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> memberService.setHomeBox(1L, 999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("크로스핏박스를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("홈박스 ID 조회 - 홈박스 있음")
    void getHomeBoxId_withHomeBox() {
        // given
        Member memberWithHomeBox = Member.builder()
                .id(1L)
                .username("testUser")
                .email("test@email.com")
                .homeBox(crossfitBox)
                .build();

        when(memberRepository.findById(1L)).thenReturn(Optional.of(memberWithHomeBox));

        // when
        Long result = memberService.getHomeBoxId(1L);

        // then
        assertThat(result).isEqualTo(1L);
    }

    @Test
    @DisplayName("홈박스 ID 조회 - 홈박스 없음")
    void getHomeBoxId_withoutHomeBox() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        Long result = memberService.getHomeBoxId(1L);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("홈박스 ID 조회 - 회원 없음")
    void getHomeBoxId_memberNotFound() {
        // given
        when(memberRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> memberService.getHomeBoxId(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("회원을 찾을 수 없습니다");
    }
}
