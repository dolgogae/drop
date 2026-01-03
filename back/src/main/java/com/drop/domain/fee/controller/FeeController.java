package com.drop.domain.fee.controller;

import com.drop.domain.fee.dto.CrossfitBoxFeeDto;
import com.drop.domain.fee.dto.CrossfitBoxFeeCreateDto;
import com.drop.domain.fee.dto.CrossfitBoxFeeUpdateDto;
import com.drop.domain.fee.service.FeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/fee")
public class FeeController {
    private final FeeService feeService;

    @PostMapping
    public ResponseEntity<CrossfitBoxFeeDto> createCrossfitBoxFee(@RequestBody @Valid CrossfitBoxFeeCreateDto crossfitBoxFeeCreateDto){
        CrossfitBoxFeeDto result = feeService.createCrossfitBoxFee(crossfitBoxFeeCreateDto);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrossfitBoxFeeDto> getCrossfitBoxFee(@PathVariable Long id){
        CrossfitBoxFeeDto result = feeService.getCrossfitBoxFee(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<CrossfitBoxFeeDto> updateCrossfitBoxFee(@RequestBody @Valid CrossfitBoxFeeUpdateDto crossfitBoxFeeUpdateDto){
        CrossfitBoxFeeDto result = feeService.updateFee(crossfitBoxFeeUpdateDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
