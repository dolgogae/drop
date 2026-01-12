package com.drop.unit.domain.membercrossfitbox.service;

import com.drop.domain.base.Address;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.membercrossfitbox.data.MemberCrossfitBox;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxDto;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxPreviewDto;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxRequestDto;
import com.drop.domain.membercrossfitbox.repository.MemberCrossfitBoxRepository;
import com.drop.domain.membercrossfitbox.service.MemberCrossfitBoxService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberCrossfitBoxServiceTest {

    @Mock
    private MemberCrossfitBoxRepository memberCrossfitBoxRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private CrossfitBoxRepository crossfitBoxRepository;

    @InjectMocks
    private MemberCrossfitBoxService memberCrossfitBoxService;

    private Member member;
    private CrossfitBox crossfitBox;
    private MemberCrossfitBox memberCrossfitBox;

    @BeforeEach
    void setUp() {
        member = Member.builder()
                .id(1L)
                .username("testUser")
                .email("test@email.com")
                .build();

        crossfitBox = CrossfitBox.builder()
                .id(1L)
                .name("Test Box")
                .email("box@email.com")
                .address(Address.builder().addressLine1("서울시 강남구").build())
                .build();

        memberCrossfitBox = MemberCrossfitBox.builder()
                .id(1L)
                .member(member)
                .crossfitBox(crossfitBox)
                .isFavorite(false)
                .build();
    }

    @Test
    @DisplayName("내 크로스핏박스 목록 조회")
    void getMyCrossfitBoxes() {
        // given
        when(memberCrossfitBoxRepository.findByMemberIdWithCrossfitBox(1L))
                .thenReturn(List.of(memberCrossfitBox));

        // when
        List<MemberCrossfitBoxDto> result = memberCrossfitBoxService.getMyCrossfitBoxes(1L);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCrossfitBoxId()).isEqualTo(1L);
        assertThat(result.get(0).getName()).isEqualTo("Test Box");
    }

    @Test
    @DisplayName("내 크로스핏박스 프리뷰 조회 - memberId가 null")
    void getMyCrossfitBoxesPreview_nullMemberId() {
        // when
        List<MemberCrossfitBoxPreviewDto> result = memberCrossfitBoxService.getMyCrossfitBoxesPreview(null);

        // then
        assertThat(result).isEmpty();
        verify(memberCrossfitBoxRepository, never()).findByMemberIdWithCrossfitBoxIncludeDeleted(any());
    }

    @Test
    @DisplayName("내 크로스핏박스 프리뷰 조회 - 정상")
    void getMyCrossfitBoxesPreview_success() {
        // given
        when(memberCrossfitBoxRepository.findByMemberIdWithCrossfitBoxIncludeDeleted(1L))
                .thenReturn(List.of(memberCrossfitBox));

        // when
        List<MemberCrossfitBoxPreviewDto> result = memberCrossfitBoxService.getMyCrossfitBoxesPreview(1L);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Box");
        assertThat(result.get(0).getIsDeleted()).isFalse();
    }

    @Test
    @DisplayName("내 크로스핏박스 수 조회 - memberId가 null")
    void countMyCrossfitBoxes_nullMemberId() {
        // when
        int result = memberCrossfitBoxService.countMyCrossfitBoxes(null);

        // then
        assertThat(result).isZero();
    }

    @Test
    @DisplayName("내 크로스핏박스 수 조회 - 정상")
    void countMyCrossfitBoxes_success() {
        // given
        when(memberCrossfitBoxRepository.countByMemberId(1L)).thenReturn(5);

        // when
        int result = memberCrossfitBoxService.countMyCrossfitBoxes(1L);

        // then
        assertThat(result).isEqualTo(5);
    }

    @Test
    @DisplayName("내 목록에 크로스핏박스 추가 - 성공")
    void addCrossfitBoxToMyList_success() {
        // given
        MemberCrossfitBoxRequestDto requestDto = new MemberCrossfitBoxRequestDto(1L, true);

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));
        when(memberCrossfitBoxRepository.existsByMemberAndCrossfitBox(member, crossfitBox)).thenReturn(false);
        when(memberCrossfitBoxRepository.save(any(MemberCrossfitBox.class))).thenReturn(memberCrossfitBox);

        // when
        MemberCrossfitBoxDto result = memberCrossfitBoxService.addCrossfitBoxToMyList(1L, requestDto);

        // then
        assertThat(result).isNotNull();
        verify(memberCrossfitBoxRepository).save(any(MemberCrossfitBox.class));
    }

    @Test
    @DisplayName("내 목록에 크로스핏박스 추가 - 회원 없음")
    void addCrossfitBoxToMyList_memberNotFound() {
        // given
        MemberCrossfitBoxRequestDto requestDto = new MemberCrossfitBoxRequestDto(1L, false);

        when(memberRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> memberCrossfitBoxService.addCrossfitBoxToMyList(999L, requestDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("회원을 찾을 수 없습니다");
    }

    @Test
    @DisplayName("내 목록에 크로스핏박스 추가 - 이미 등록됨")
    void addCrossfitBoxToMyList_alreadyExists() {
        // given
        MemberCrossfitBoxRequestDto requestDto = new MemberCrossfitBoxRequestDto(1L, false);

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));
        when(memberCrossfitBoxRepository.existsByMemberAndCrossfitBox(member, crossfitBox)).thenReturn(true);

        // when & then
        assertThatThrownBy(() -> memberCrossfitBoxService.addCrossfitBoxToMyList(1L, requestDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이미 등록된 크로스핏박스입니다");
    }

    @Test
    @DisplayName("즐겨찾기 토글 - 성공")
    void toggleFavorite_success() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));
        when(memberCrossfitBoxRepository.findByMemberAndCrossfitBox(member, crossfitBox))
                .thenReturn(Optional.of(memberCrossfitBox));

        // when
        MemberCrossfitBoxDto result = memberCrossfitBoxService.toggleFavorite(1L, 1L);

        // then
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("즐겨찾기 토글 - 목록에 없음")
    void toggleFavorite_notInList() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));
        when(memberCrossfitBoxRepository.findByMemberAndCrossfitBox(member, crossfitBox))
                .thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> memberCrossfitBoxService.toggleFavorite(1L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("내 크로스핏박스 목록에 없습니다");
    }

    @Test
    @DisplayName("내 목록에서 크로스핏박스 제거 - 성공")
    void removeCrossfitBoxFromMyList_success() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));

        // when
        memberCrossfitBoxService.removeCrossfitBoxFromMyList(1L, 1L);

        // then
        verify(memberCrossfitBoxRepository).deleteByMemberAndCrossfitBox(member, crossfitBox);
    }

    @Test
    @DisplayName("내 목록에서 크로스핏박스 제거 - 크로스핏박스 없음")
    void removeCrossfitBoxFromMyList_crossfitBoxNotFound() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(crossfitBoxRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> memberCrossfitBoxService.removeCrossfitBoxFromMyList(1L, 999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("크로스핏박스를 찾을 수 없습니다");
    }
}
