package com.drop.unit.domain.home.service;

import com.drop.domain.base.Address;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.service.CrossfitBoxService;
import com.drop.domain.home.dto.HomeSummaryDto;
import com.drop.domain.home.service.HomeService;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxPreviewDto;
import com.drop.domain.membercrossfitbox.service.MemberCrossfitBoxService;
import com.drop.global.enums.LocationMode;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HomeServiceTest {

    @Mock
    private CrossfitBoxService crossfitBoxService;

    @Mock
    private MemberCrossfitBoxService memberCrossfitBoxService;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private HomeService homeService;

    private Member member;
    private CrossfitBox homeBox;

    @BeforeEach
    void setUp() {
        homeBox = CrossfitBox.builder()
                .id(1L)
                .name("Home Box")
                .address(Address.builder().addressLine1("서울시 강남구").build())
                .build();

        member = Member.builder()
                .id(1L)
                .username("testUser")
                .email("test@email.com")
                .homeBox(homeBox)
                .build();
    }

    @Test
    @DisplayName("홈 요약 조회 - 홈박스 있음")
    void getHomeSummary_withHomeBox() {
        // given
        Long memberId = 1L;
        LocationMode locationMode = LocationMode.CURRENT;
        Double latGrid = 37.5;
        Double lngGrid = 127.0;

        List<MemberCrossfitBoxPreviewDto> previewList = List.of(
                MemberCrossfitBoxPreviewDto.builder()
                        .crossfitBoxId(1L)
                        .name("Test Box")
                        .isFavorite(true)
                        .build()
        );

        when(crossfitBoxService.countNearbyCrossfitBoxes(latGrid, lngGrid)).thenReturn(10);
        when(memberCrossfitBoxService.getMyCrossfitBoxesPreview(memberId)).thenReturn(previewList);
        when(memberCrossfitBoxService.countMyCrossfitBoxes(memberId)).thenReturn(3);
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));

        // when
        HomeSummaryDto result = homeService.getHomeSummary(memberId, locationMode, latGrid, lngGrid);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getNearbyCrossfitBoxCount()).isEqualTo(10);
        assertThat(result.getNearbyBasis()).isEqualTo(LocationMode.CURRENT);
        assertThat(result.getMyCrossfitBoxesPreview()).hasSize(1);
        assertThat(result.getHasMoreMyCrossfitBoxes()).isFalse();
        assertThat(result.getHomeBox()).isNotNull();
        assertThat(result.getHomeBox().getName()).isEqualTo("Home Box");
    }

    @Test
    @DisplayName("홈 요약 조회 - 홈박스 없음")
    void getHomeSummary_withoutHomeBox() {
        // given
        Long memberId = 1L;
        Member memberWithoutHomeBox = Member.builder()
                .id(1L)
                .username("testUser")
                .email("test@email.com")
                .build();

        when(crossfitBoxService.countNearbyCrossfitBoxes(null, null)).thenReturn(100);
        when(memberCrossfitBoxService.getMyCrossfitBoxesPreview(memberId)).thenReturn(List.of());
        when(memberCrossfitBoxService.countMyCrossfitBoxes(memberId)).thenReturn(0);
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(memberWithoutHomeBox));

        // when
        HomeSummaryDto result = homeService.getHomeSummary(memberId, null, null, null);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getHomeBox()).isNull();
        assertThat(result.getNearbyBasis()).isEqualTo(LocationMode.CURRENT); // 기본값
    }

    @Test
    @DisplayName("홈 요약 조회 - 회원 없음")
    void getHomeSummary_memberNotFound() {
        // given
        Long memberId = 999L;

        when(crossfitBoxService.countNearbyCrossfitBoxes(null, null)).thenReturn(10);
        when(memberCrossfitBoxService.getMyCrossfitBoxesPreview(memberId)).thenReturn(List.of());
        when(memberCrossfitBoxService.countMyCrossfitBoxes(memberId)).thenReturn(0);
        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

        // when
        HomeSummaryDto result = homeService.getHomeSummary(memberId, null, null, null);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getHomeBox()).isNull();
    }

    @Test
    @DisplayName("홈 요약 조회 - 5개 초과 크로스핏박스")
    void getHomeSummary_hasMoreCrossfitBoxes() {
        // given
        Long memberId = 1L;

        when(crossfitBoxService.countNearbyCrossfitBoxes(null, null)).thenReturn(10);
        when(memberCrossfitBoxService.getMyCrossfitBoxesPreview(memberId)).thenReturn(List.of());
        when(memberCrossfitBoxService.countMyCrossfitBoxes(memberId)).thenReturn(10); // 5개 초과
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));

        // when
        HomeSummaryDto result = homeService.getHomeSummary(memberId, LocationMode.LAST, null, null);

        // then
        assertThat(result.getHasMoreMyCrossfitBoxes()).isTrue();
        assertThat(result.getNearbyBasis()).isEqualTo(LocationMode.LAST);
    }
}
