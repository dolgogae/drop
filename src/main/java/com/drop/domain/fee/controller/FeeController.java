package com.drop.domain.fee.controller;

import com.drop.domain.fee.dto.FeeDto;
import com.drop.domain.fee.dto.GymFeeCreateDto;
import com.drop.domain.fee.dto.GymFeeUpdateDto;
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
    public ResponseEntity<FeeDto> createFee(@RequestBody @Valid GymFeeCreateDto gymFeeCreateDto){
        FeeDto result = feeService.createGymFee(gymFeeCreateDto);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<FeeDto> updateFee(@RequestBody @Valid GymFeeUpdateDto gymFeeUpdateDto){
        FeeDto result = feeService.updateFee(gymFeeUpdateDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
