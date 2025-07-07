package com.drop.global.code.error.exception;

import com.drop.global.code.error.ErrorCode;

public class AuthenticationNotFoundException extends BusinessException {
    public AuthenticationNotFoundException() {
        super(ErrorCode.AUTHENTICATION_NOT_FOUND);
    }
}