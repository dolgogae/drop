package com.drop.unit.domain.crossfitbox.service;

import com.drop.domain.base.Address;
import com.drop.domain.base.AddressDto;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.dto.CrossfitBoxCreateDto;
import com.drop.domain.crossfitbox.dto.CrossfitBoxDto;
import com.drop.domain.crossfitbox.dto.CrossfitBoxUpdateDto;
import com.drop.domain.crossfitbox.mapper.CrossfitBoxMapper;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.crossfitbox.service.CrossfitBoxService;
import com.drop.domain.geocoding.service.GeocodingService;
import com.drop.global.enums.UserRole;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CrossfitBoxServiceTest {

    @Mock
    private CrossfitBoxMapper crossfitBoxMapper;

    @Mock
    private CrossfitBoxRepository crossfitBoxRepository;

    @Mock
    private GeocodingService geocodingService;

    @InjectMocks
    private CrossfitBoxService crossfitBoxService;

    private CrossfitBox crossfitBox;
    private CrossfitBoxDto crossfitBoxDto;

    @BeforeEach
    void setUp() {
        crossfitBox = CrossfitBox.builder()
                .id(1L)
                .username("testBox")
                .email("test@box.com")
                .password("password")
                .role(UserRole.GYM)
                .name("Test CrossfitBox")
                .phoneNumber("010-1234-5678")
                .build();

        crossfitBoxDto = CrossfitBoxDto.builder()
                .id(1L)
                .username("testBox")
                .email("test@box.com")
                .role(UserRole.GYM)
                .name("Test CrossfitBox")
                .phoneNumber("010-1234-5678")
                .build();
    }

    @Test
    @DisplayName("크로스핏박스 생성 - 주소 없음")
    void createCrossfitBox_withoutAddress() {
        // given
        CrossfitBoxCreateDto createDto = CrossfitBoxCreateDto.builder()
                .username("testBox")
                .email("test@box.com")
                .password("password")
                .role(UserRole.GYM)
                .phoneNumber("010-1234-5678")
                .build();

        when(crossfitBoxRepository.save(any(CrossfitBox.class))).thenReturn(crossfitBox);
        when(crossfitBoxMapper.toDto(any(CrossfitBox.class))).thenReturn(crossfitBoxDto);

        // when
        CrossfitBoxDto result = crossfitBoxService.createCrossfitBox(createDto);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@box.com");
        verify(geocodingService, never()).getCoordinates(anyString());
    }

    @Test
    @DisplayName("크로스핏박스 생성 - 주소 있음, 좌표 변환 성공")
    void createCrossfitBox_withAddress_geocodingSuccess() {
        // given
        AddressDto addressDto = AddressDto.builder()
                .addressLine1("서울시 강남구")
                .build();

        CrossfitBoxCreateDto createDto = CrossfitBoxCreateDto.builder()
                .username("testBox")
                .email("test@box.com")
                .password("password")
                .role(UserRole.GYM)
                .phoneNumber("010-1234-5678")
                .address(addressDto)
                .build();

        GeocodingService.Coordinates coords = new GeocodingService.Coordinates(37.5, 127.0);
        when(geocodingService.getCoordinates("서울시 강남구")).thenReturn(Optional.of(coords));
        when(crossfitBoxRepository.save(any(CrossfitBox.class))).thenReturn(crossfitBox);
        when(crossfitBoxMapper.toDto(any(CrossfitBox.class))).thenReturn(crossfitBoxDto);

        // when
        CrossfitBoxDto result = crossfitBoxService.createCrossfitBox(createDto);

        // then
        assertThat(result).isNotNull();
        verify(geocodingService).getCoordinates("서울시 강남구");
    }

    @Test
    @DisplayName("크로스핏박스 생성 - 주소 좌표 변환 실패시 예외 발생")
    void createCrossfitBox_geocodingFailed_throwsException() {
        // given
        AddressDto addressDto = AddressDto.builder()
                .addressLine1("잘못된 주소")
                .build();

        CrossfitBoxCreateDto createDto = CrossfitBoxCreateDto.builder()
                .username("testBox")
                .email("test@box.com")
                .password("password")
                .address(addressDto)
                .build();

        when(geocodingService.getCoordinates("잘못된 주소")).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> crossfitBoxService.createCrossfitBox(createDto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("주소를 좌표로 변환할 수 없습니다");
    }

    @Test
    @DisplayName("위치 정보가 있는 모든 크로스핏박스 조회")
    void getAllCrossfitBoxesWithLocation() {
        // given
        when(crossfitBoxRepository.findAllWithLocation()).thenReturn(List.of(crossfitBox));
        when(crossfitBoxMapper.toDto(crossfitBox)).thenReturn(crossfitBoxDto);

        // when
        List<CrossfitBoxDto> result = crossfitBoxService.getAllCrossfitBoxesWithLocation();

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test CrossfitBox");
    }

    @Test
    @DisplayName("경계 좌표로 크로스핏박스 조회")
    void getCrossfitBoxesByBounds() {
        // given
        when(crossfitBoxRepository.findByBounds(37.0, 126.0, 38.0, 128.0))
                .thenReturn(List.of(crossfitBox));
        when(crossfitBoxMapper.toDto(crossfitBox)).thenReturn(crossfitBoxDto);

        // when
        List<CrossfitBoxDto> result = crossfitBoxService.getCrossfitBoxesByBounds(
                37.0, 126.0, 38.0, 128.0);

        // then
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("ID로 크로스핏박스 조회 - 성공")
    void getCrossfitBoxById_success() {
        // given
        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));
        when(crossfitBoxMapper.toDto(crossfitBox)).thenReturn(crossfitBoxDto);

        // when
        CrossfitBoxDto result = crossfitBoxService.getCrossfitBoxById(1L);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("ID로 크로스핏박스 조회 - 존재하지 않음")
    void getCrossfitBoxById_notFound() {
        // given
        when(crossfitBoxRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> crossfitBoxService.getCrossfitBoxById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("크로스핏박스를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("이름으로 크로스핏박스 검색 - 결과 있음")
    void searchByName_withResults() {
        // given
        when(crossfitBoxRepository.searchByName("Test")).thenReturn(List.of(crossfitBox));
        when(crossfitBoxMapper.toDto(crossfitBox)).thenReturn(crossfitBoxDto);

        // when
        List<CrossfitBoxDto> result = crossfitBoxService.searchByName("Test");

        // then
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("이름으로 크로스핏박스 검색 - 빈 키워드")
    void searchByName_emptyKeyword() {
        // when
        List<CrossfitBoxDto> result1 = crossfitBoxService.searchByName(null);
        List<CrossfitBoxDto> result2 = crossfitBoxService.searchByName("");
        List<CrossfitBoxDto> result3 = crossfitBoxService.searchByName("   ");

        // then
        assertThat(result1).isEmpty();
        assertThat(result2).isEmpty();
        assertThat(result3).isEmpty();
        verify(crossfitBoxRepository, never()).searchByName(anyString());
    }

    @Test
    @DisplayName("크로스핏박스 정보 수정")
    void updateCrossfitBox() {
        // given
        CrossfitBoxUpdateDto updateDto = CrossfitBoxUpdateDto.builder()
                .name("Updated Name")
                .phoneNumber("010-9999-8888")
                .build();

        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));
        when(crossfitBoxMapper.toDto(any(CrossfitBox.class))).thenReturn(crossfitBoxDto);

        // when
        CrossfitBoxDto result = crossfitBoxService.updateCrossfitBox(1L, updateDto);

        // then
        assertThat(result).isNotNull();
        verify(crossfitBoxRepository).findById(1L);
    }

    @Test
    @DisplayName("크로스핏박스 수정 - 존재하지 않음")
    void updateCrossfitBox_notFound() {
        // given
        CrossfitBoxUpdateDto updateDto = CrossfitBoxUpdateDto.builder()
                .name("Updated Name")
                .build();

        when(crossfitBoxRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> crossfitBoxService.updateCrossfitBox(999L, updateDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("크로스핏박스를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("주변 크로스핏박스 수 조회 - 좌표 있음")
    void countNearbyCrossfitBoxes_withCoordinates() {
        // given
        when(crossfitBoxRepository.findByBounds(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(List.of(crossfitBox));

        // when
        int count = crossfitBoxService.countNearbyCrossfitBoxes(37.5, 127.0);

        // then
        assertThat(count).isEqualTo(1);
    }

    @Test
    @DisplayName("주변 크로스핏박스 수 조회 - 좌표 없음 (전체 개수)")
    void countNearbyCrossfitBoxes_withoutCoordinates() {
        // given
        when(crossfitBoxRepository.count()).thenReturn(10L);

        // when
        int count = crossfitBoxService.countNearbyCrossfitBoxes(null, null);

        // then
        assertThat(count).isEqualTo(10);
    }
}
