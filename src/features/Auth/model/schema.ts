import { z } from 'zod'

export const loginSchema = z.object({
	email: z.email('некорректный формат email'),
	password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
})

export type LoginForm = z.infer<typeof loginSchema>

export const registerSchema = z
	.object({
		username: z
			.string()
			.min(2, 'Имя должно быть минимум 2 символа')
			.max(50, 'Имя слишком длинное')
			.trim(),
		email: z.email('некорректный формат email'),
		password: z
			.string()
			.min(8, 'Пароль должен содержать минимум 8 символов')
			.regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
			.regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
			.regex(/[^A-Za-z0-9]/, 'Пароль должен содержать хотя бы один специальный символ'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword'],
	})

export type RegisterForm = z.infer<typeof registerSchema>

export const otpSchema = z.object({
	otpCode: z.string().length(6).regex(/^\d+$/, 'Код должен состоять из 6 цифр'),
})

export type OtpForm = z.infer<typeof otpSchema>
