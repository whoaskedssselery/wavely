import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { NavLink, useNavigate } from 'react-router-dom'
import { type LoginForm, loginSchema } from '@/features/Auth/model/schema.ts'
import './Login.scss'
import { useState } from 'react'
import { supabase } from '@/shared/lib/supabase.ts'
import { EyeIcon, EyeOffIcon } from '@/shared/ui/icons'
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
		await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/`,
			},
		})
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
								{showPassword ? <EyeOffIcon /> : <EyeIcon />}
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
