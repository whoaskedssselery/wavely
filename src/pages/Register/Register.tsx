import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { NavLink, useNavigate } from 'react-router-dom'
import { type RegisterForm, registerSchema } from '@/features/Auth/model/schema.ts'
import getOAuthRedirectUrl from '@/shared/lib/getOAuthRedirectUrl.ts'
import { supabase } from '@/shared/lib/supabase.ts'
import Logo from '@/shared/ui/Logo'
import './Register.scss'

const Register = () => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterForm>({
		resolver: zodResolver(registerSchema),
		mode: 'onBlur',
	})

	const navigate = useNavigate()
	const [serverError, setServerError] = useState<string | null>(null)
	const [showPassword, setShowPassword] = useState(false)

	const handleOAuth = async (provider: 'github' | 'google') => {
		const { data } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: getOAuthRedirectUrl(),
				skipBrowserRedirect: !!window.electronAPI,
			},
		})

		if (window.electronAPI && data.url) {
			window.electronAPI.openExternal(data.url)
		}
	}

	const onSubmit = async (data: RegisterForm) => {
		const { data: signUpData, error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				data: { username: data.username },
			},
		})

		if (error) {
			setServerError(error.message)
			return
		}

		if (signUpData.user?.identities?.length === 0) {
			setServerError('Аккаунт с таким email уже существует')
			return
		}

		navigate('/confirm', { state: { email: data.email, from: '/register', type: 'signup' } })
	}

	return (
		<motion.section
			className="register"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.2 }}
		>
			<div className="register__brand">
				<Logo />
			</div>

			<div className="register__card">
				<h2 className="register__title">Регистрация</h2>

				<div className="register__oauth">
					<button
						className="register__oauth-btn"
						type="button"
						onClick={() => handleOAuth('google')}
					>
						Google
					</button>
					<button
						className="register__oauth-btn"
						type="button"
						onClick={() => handleOAuth('github')}
					>
						GitHub
					</button>
				</div>

				<div className="register__divider">
					<span>или</span>
				</div>

				<form className="register__form" onSubmit={handleSubmit(onSubmit)}>
					<div className="register__field">
						<label className="register__label" htmlFor="usernameForm">
							Имя<span className="register__required">*</span>
						</label>
						<input
							className="register__input"
							{...register('username')}
							type="text"
							id="usernameForm"
							autoComplete="username"
						/>
						{errors.username && <p className="register__error">{errors.username.message}</p>}
					</div>
					<div className="register__field">
						<label className="register__label" htmlFor="emailForm">
							Почта<span className="register__required">*</span>
						</label>
						<input
							className="register__input"
							{...register('email')}
							type="email"
							id="emailForm"
							autoComplete="email"
						/>
						{errors.email && <p className="register__error">{errors.email.message}</p>}
					</div>
					<div className="register__field">
						<label className="register__label" htmlFor="passwordForm">
							Пароль<span className="register__required">*</span>
						</label>
						<div className="register__input-wrapper">
							<input
								className="register__input"
								{...register('password')}
								type={showPassword ? 'text' : 'password'}
								id="passwordForm"
								autoComplete="new-password"
							/>
							<button
								type="button"
								className="register__password-toggle"
								onClick={() => setShowPassword((prev) => !prev)}
							>
								{showPassword ? (
									<svg
										aria-hidden="true"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
										<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
										<line x1="1" y1="1" x2="23" y2="23" />
									</svg>
								) : (
									<svg
										aria-hidden="true"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
								)}
							</button>
						</div>
						{errors.password && <p className="register__error">{errors.password.message}</p>}
					</div>
					<div className="register__field">
						<label className="register__label" htmlFor="confirmPasswordForm">
							Подтвердите пароль<span className="register__required">*</span>
						</label>
						<input
							className="register__input"
							{...register('confirmPassword')}
							type="password"
							id="confirmPasswordForm"
							autoComplete="new-password"
						/>
						{errors.confirmPassword && (
							<p className="register__error">{errors.confirmPassword.message}</p>
						)}
					</div>
					<button className="register__submit-button" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Регистрируемся...' : 'Зарегистрироваться'}
					</button>
				</form>
				{serverError && <p className="register__error">{serverError}</p>}

				<p className="register__footer">
					Уже есть аккаунт? <NavLink to="/login">Войти</NavLink>
				</p>
			</div>
		</motion.section>
	)
}

export default Register
