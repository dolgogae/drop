package com.drop.domain.membergym.service;

import com.drop.domain.membergym.data.MemberGym;
import com.drop.domain.membergym.dto.MemberGymDto;
import com.drop.domain.membergym.dto.MemberGymPreviewDto;
import com.drop.domain.membergym.dto.MemberGymRequestDto;
import com.drop.domain.membergym.repository.MemberGymRepository;
import com.drop.domain.user.gym.data.Gym;
import com.drop.domain.user.gym.repository.GymRepository;
import com.drop.domain.user.member.data.Member;
import com.drop.domain.user.member.repository.MemberRepository;
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
public class MemberGymService {

    private final MemberGymRepository memberGymRepository;
    private final MemberRepository memberRepository;
    private final GymRepository gymRepository;

    private static final int MY_GYMS_PREVIEW_LIMIT = 5;

    @Transactional(readOnly = true)
    public List<MemberGymDto> getMyGyms(Long memberId) {
        return memberGymRepository.findByMemberIdWithGym(memberId).stream()
                .map(this::toMemberGymDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MemberGymPreviewDto> getMyGymsPreview(Long memberId) {
        if (memberId == null) {
            return Collections.emptyList();
        }

        List<MemberGym> memberGyms = memberGymRepository.findByMemberIdWithGymIncludeDeleted(memberId);

        return memberGyms.stream()
                .limit(MY_GYMS_PREVIEW_LIMIT)
                .map(mg -> {
                    boolean isDeleted = mg.getGym() == null;
                    return MemberGymPreviewDto.builder()
                            .gymId(isDeleted ? mg.getId() : mg.getGym().getId())
                            .name(isDeleted ? "삭제된 체육관" : mg.getGym().getName())
                            .isFavorite(mg.getIsFavorite())
                            .isDeleted(isDeleted)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public int countMyGyms(Long memberId) {
        if (memberId == null) {
            return 0;
        }
        return memberGymRepository.countByMemberId(memberId);
    }

    @Transactional
    public MemberGymDto addGymToMyList(Long memberId, MemberGymRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Gym gym = gymRepository.findById(request.getGymId())
                .orElseThrow(() -> new IllegalArgumentException("체육관을 찾을 수 없습니다."));

        if (memberGymRepository.existsByMemberAndGym(member, gym)) {
            throw new IllegalArgumentException("이미 등록된 체육관입니다.");
        }

        MemberGym memberGym = MemberGym.create(member, gym, request.getIsFavorite());
        MemberGym saved = memberGymRepository.save(memberGym);

        return toMemberGymDto(saved);
    }

    @Transactional
    public MemberGymDto toggleFavorite(Long memberId, Long gymId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new IllegalArgumentException("체육관을 찾을 수 없습니다."));

        MemberGym memberGym = memberGymRepository.findByMemberAndGym(member, gym)
                .orElseThrow(() -> new IllegalArgumentException("내 체육관 목록에 없습니다."));

        memberGym.toggleFavorite();

        return toMemberGymDto(memberGym);
    }

    @Transactional
    public void removeGymFromMyList(Long memberId, Long gymId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new IllegalArgumentException("체육관을 찾을 수 없습니다."));

        memberGymRepository.deleteByMemberAndGym(member, gym);
    }

    private MemberGymDto toMemberGymDto(MemberGym memberGym) {
        Gym gym = memberGym.getGym();
        return MemberGymDto.builder()
                .gymId(gym.getId())
                .name(gym.getName())
                .location(gym.getLocation())
                .isFavorite(memberGym.getIsFavorite())
                .build();
    }
}
