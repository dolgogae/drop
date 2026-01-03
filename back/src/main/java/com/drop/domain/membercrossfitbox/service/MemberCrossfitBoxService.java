package com.drop.domain.membercrossfitbox.service;

import com.drop.domain.membercrossfitbox.data.MemberCrossfitBox;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxDto;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxPreviewDto;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxRequestDto;
import com.drop.domain.membercrossfitbox.repository.MemberCrossfitBoxRepository;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberCrossfitBoxService {

    private final MemberCrossfitBoxRepository memberCrossfitBoxRepository;
    private final MemberRepository memberRepository;
    private final CrossfitBoxRepository crossfitBoxRepository;

    private static final int MY_CROSSFIT_BOXES_PREVIEW_LIMIT = 5;

    @Transactional(readOnly = true)
    public List<MemberCrossfitBoxDto> getMyCrossfitBoxes(Long memberId) {
        return memberCrossfitBoxRepository.findByMemberIdWithCrossfitBox(memberId).stream()
                .map(this::toMemberCrossfitBoxDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MemberCrossfitBoxPreviewDto> getMyCrossfitBoxesPreview(Long memberId) {
        if (memberId == null) {
            return Collections.emptyList();
        }

        List<MemberCrossfitBox> memberCrossfitBoxes = memberCrossfitBoxRepository.findByMemberIdWithCrossfitBoxIncludeDeleted(memberId);

        return memberCrossfitBoxes.stream()
                .limit(MY_CROSSFIT_BOXES_PREVIEW_LIMIT)
                .map(mcb -> {
                    boolean isDeleted = mcb.getCrossfitBox() == null;
                    return MemberCrossfitBoxPreviewDto.builder()
                            .crossfitBoxId(isDeleted ? mcb.getId() : mcb.getCrossfitBox().getId())
                            .name(isDeleted ? "삭제된 크로스핏박스" : mcb.getCrossfitBox().getName())
                            .isFavorite(mcb.getIsFavorite())
                            .isDeleted(isDeleted)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public int countMyCrossfitBoxes(Long memberId) {
        if (memberId == null) {
            return 0;
        }
        return memberCrossfitBoxRepository.countByMemberId(memberId);
    }

    @Transactional
    public MemberCrossfitBoxDto addCrossfitBoxToMyList(Long memberId, MemberCrossfitBoxRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        CrossfitBox crossfitBox = crossfitBoxRepository.findById(request.getCrossfitBoxId())
                .orElseThrow(() -> new IllegalArgumentException("크로스핏박스를 찾을 수 없습니다."));

        if (memberCrossfitBoxRepository.existsByMemberAndCrossfitBox(member, crossfitBox)) {
            throw new IllegalArgumentException("이미 등록된 크로스핏박스입니다.");
        }

        MemberCrossfitBox memberCrossfitBox = MemberCrossfitBox.create(member, crossfitBox, request.getIsFavorite());
        MemberCrossfitBox saved = memberCrossfitBoxRepository.save(memberCrossfitBox);

        return toMemberCrossfitBoxDto(saved);
    }

    @Transactional
    public MemberCrossfitBoxDto toggleFavorite(Long memberId, Long crossfitBoxId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        CrossfitBox crossfitBox = crossfitBoxRepository.findById(crossfitBoxId)
                .orElseThrow(() -> new IllegalArgumentException("크로스핏박스를 찾을 수 없습니다."));

        MemberCrossfitBox memberCrossfitBox = memberCrossfitBoxRepository.findByMemberAndCrossfitBox(member, crossfitBox)
                .orElseThrow(() -> new IllegalArgumentException("내 크로스핏박스 목록에 없습니다."));

        memberCrossfitBox.toggleFavorite();

        return toMemberCrossfitBoxDto(memberCrossfitBox);
    }

    @Transactional
    public void removeCrossfitBoxFromMyList(Long memberId, Long crossfitBoxId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        CrossfitBox crossfitBox = crossfitBoxRepository.findById(crossfitBoxId)
                .orElseThrow(() -> new IllegalArgumentException("크로스핏박스를 찾을 수 없습니다."));

        memberCrossfitBoxRepository.deleteByMemberAndCrossfitBox(member, crossfitBox);
    }

    private MemberCrossfitBoxDto toMemberCrossfitBoxDto(MemberCrossfitBox memberCrossfitBox) {
        CrossfitBox crossfitBox = memberCrossfitBox.getCrossfitBox();
        String location = crossfitBox.getAddress() != null ? crossfitBox.getAddress().getAddressLine1() : null;
        return MemberCrossfitBoxDto.builder()
                .crossfitBoxId(crossfitBox.getId())
                .name(crossfitBox.getName())
                .location(location)
                .isFavorite(memberCrossfitBox.getIsFavorite())
                .build();
    }
}
