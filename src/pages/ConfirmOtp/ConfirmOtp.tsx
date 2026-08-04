import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { type OtpForm, otpSchema } from '@/features/Auth/model/schema.ts'
import { supabase } from '@/shared/lib/supabase.ts'
import Logo from '@/shared/ui/Logo'
import './ConfirmOtp.scss'

const RESEND_COOLDOWN_SECONDS = 30

const ConfirmOtp = () => {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<OtpForm>({
		resolver: zodResolver(otpSchema),
		mode: 'onBlur',
	})

	const navigate = useNavigate()
	const { state } = useLocation()
	const [serverError, setServerError] = useState<string | null>(null)
	const [resendError, setResendError] = useState<string | null>(null)
	const [isResending, setIsResending] = useState(false)
	const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS)

	useEffect(() => {
		const intervalId = setInterval(() => {
			setResendCooldown((seconds) => Math.max(0, seconds - 1))
		}, 1000)

		return () => clearInterval(intervalId)
	}, [])

	const onSubmit = async (data: OtpForm) => {
		const { error } = await supabase.auth.verifyOtp({
			email: state.email,
			token: data.otpCode,
			type: 'signup',
		})

		if (error) {
			setServerError(error.message)
			return
		}

		navigate('/')
	}

	const handleResend = async () => {
		setIsResending(true)
		setResendError(null)

		const { error } = await supabase.auth.resend({
			type: 'signup',
			email: state.email,
		})

		setIsResending(false)

		if (error) {
			setResendError(error.message)
			return
		}

		setResendCooldown(RESEND_COOLDOWN_SECONDS)
	}

	if (!state?.email) {
		return <Navigate to={state?.from ?? '/register'} replace />
	}

	return (
		<motion.section
			className="confirm-otp"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.2 }}
		>
			<div className="confirm-otp__brand">
				<Logo />
			</div>

			<div className="confirm-otp__card">
				<h2 className="confirm-otp__title">Подтверждение регистрации</h2>
				<p className="confirm-otp__subtitle">Код отправлен на {state.email}</p>

				<form className="confirm-otp__form" onSubmit={handleSubmit(onSubmit)}>
					<div className="confirm-otp__field">
						<label className="confirm-otp__label" htmlFor="otpCodeForm">
							Код подтверждения
						</label>
						<input
							className="confirm-otp__input"
							{...register('otpCode')}
							type="text"
							inputMode="numeric"
							id="otpCodeForm"
							autoComplete="one-time-code"
						/>
					</div>
					<button className="confirm-otp__submit-button" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Подтверждаем...' : 'Подтвердить'}
					</button>
				</form>
				{serverError && <p className="confirm-otp__error">{serverError}</p>}

				<button
					type="button"
					className="confirm-otp__resend-button"
					onClick={handleResend}
					disabled={resendCooldown > 0 || isResending}
				>
					{resendCooldown > 0
						? `Отправить код повторно (${resendCooldown}с)`
						: isResending
							? 'Отправляем...'
							: 'Отправить код повторно'}
				</button>
				{resendError && <p className="confirm-otp__error">{resendError}</p>}

				<p className="confirm-otp__footer">
					Хотите изменить почту? <NavLink to={state.from ?? '/register'}>Вернуться</NavLink>
				</p>
			</div>
		</motion.section>
	)
}

export default ConfirmOtp
