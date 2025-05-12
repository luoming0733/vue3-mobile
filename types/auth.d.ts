namespace Auth {
  export interface ResponseType {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
  }
  export interface ChangePassword {
    phoneNumber: string
    code: string
    password: string
    reenteredPassword?: string
  }

  export interface ChangePhone {
    newCode: string
    newPhone: string
    oldCode: string
    oldPhone: string
  }
}
