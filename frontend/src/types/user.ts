export enum Role {
    SUPER_ADMIN = "super_admin",
    PENTESTER = "pentester",
    CLIENT = "client",
    USER = "user",
    ADMIN = "admin"
}

export interface User {
    id: number
    email: string
    full_name: string
    role: Role
    is_active: boolean
    company?: string
    bio?: string
    avatar_url?: string
    theme?: string
    last_login?: string
    created_at: string
    updated_at: string
}

export interface UserLogin {
    email: string
    password: string
}

export interface UserCreate extends UserLogin {
    full_name: string
}

export interface UserUpdate {
    email?: string
    full_name?: string
    password?: string
    company?: string
    bio?: string
    avatar_url?: string
    theme?: string
} 