
export class UserInfoDto {
    id: number | null;
    email: string | null;
    email_verified: boolean;
    name: string | null;
    phone: string | null;
    dni: string | null;
    claimed_at: Date | null;
    created_at: Date | null;
    updated_at: Date | null;
}

export class MemberResponseDto {
    id: string;
    gym_id: string;
    user_id: number | null;
    starts_at: Date | null;
    ends_at: Date | null;
    status: string;
    created_at: Date;
    updated_at: Date;
    user: UserInfoDto;
}
