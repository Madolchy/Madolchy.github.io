import jwt, { type JwtPayload } from "jsonwebtoken";

export enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
}

export type jwtData = JwtPayload & {
    id: string;
    rootFolderId: string;
    tokenType: TokenType;
};
