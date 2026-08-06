import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { NavLink, useNavigate } from 'react-router-dom'
import { type LoginForm, loginSchema } from '@/features/Auth/model/schema.ts'
import './Login.scss'
import { useState } from 'react'
import getOAuthRedirectUrl from '@/shared/lib/getOAuthRedirectUrl.ts'
import { supabase } from '@/shared/lib/supabase.ts'
import Logo from '@/shared/ui/Logo'

const Login = () => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
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

	const onSubmit = async (data: LoginForm) => {
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		})

		if (error) {
			setServerError(error.message)
			return
		}

		navigate('/')
	}

	return (
		<motion.section
			className="login"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.2 }}
		>
			<div className="login__brand">
				<Logo />
			</div>

			<div className="login__card">
				<h2 className="login__title">Вход в аккаунт</h2>

				<div className="login__oauth">
					<button className="login__oauth-btn" type="button" onClick={() => handleOAuth('google')}>
						Google
					</button>
					<button className="login__oauth-btn" type="button" onClick={() => handleOAuth('github')}>
						GitHub
					</button>
				</div>

				<div className="login__divider">
					<span>или</span>
				</div>

				<form className="login__form" onSubmit={handleSubmit(onSubmit)}>
					<div className="login__field">
						<label className="login__label" htmlFor="emailForm">
							Почта
						</label>
						<input
							className="login__input"
							{...register('email')}
							type="email"
							id="emailForm"
							autoComplete="email"
						/>
						{errors.email && <p className="login__error">{errors.email.message}</p>}
					</div>
					<div className="login__field">
						<label className="login__label" htmlFor="passwordForm">
							Пароль
						</label>
						<div className="login__input-wrapper">
							<input
								className="login__input"
								{...register('password')}
								type={showPassword ? 'text' : 'password'}
								id="passwordForm"
								autoComplete="current-password"
							/>
							<button
								type="button"
								className="login__password-toggle"
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
						{errors.password && <p className="login__error">{errors.password.message}</p>}
					</div>
					<button className="login__submit-button" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Входим...' : 'Войти'}
					</button>
				</form>
				{serverError && <p className="login__error">{serverError}</p>}

				<p className="login__footer">
					Нет аккаунта? <NavLink to="/register">Зарегистрироваться</NavLink>
				</p>
			</div>
		</motion.section>
	)
}

export default Login
