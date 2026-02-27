import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

function extractFromCookie(req: Request): string | null {
    return req?.cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: extractFromCookie,
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-me',
        });
    }

    validate(payload: { sub: string; email: string }) {
        return { id: payload.sub, email: payload.email };
    }
}
