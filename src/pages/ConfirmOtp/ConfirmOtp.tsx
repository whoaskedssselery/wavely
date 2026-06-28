import { NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { otpSchema, type OtpForm } from '@/schemas/auth.ts'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase.ts'
import { useState } from 'react'
import { motion } from 'framer-motion'
import './ConfirmOtp.scss'

const ConfirmOtp = () => {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting }
	} = useForm<OtpForm>({
		resolver: zodResolver(otpSchema),
		mode: 'onBlur'
	})
	
	const navigate = useNavigate()
	const { state } = useLocation()
	const [serverError, setServerError] = useState<string | null>(null)
	
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
			<div className="confirm-otp__brand">wavely</div>
			
			<div className="confirm-otp__card">
				<h2 className="confirm-otp__title">Подтверждение регистрации</h2>
				<p className="confirm-otp__subtitle">Код отправлен на {state.email}</p>

				<form className="confirm-otp__form" onSubmit={handleSubmit(onSubmit)}>
					<div className="confirm-otp__field">
						<label className="confirm-otp__label" htmlFor="otpCodeForm">Код подтверждения</label>
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
				
				<p className="confirm-otp__footer">
					Хотите изменить почту? <NavLink to={state.from ?? '/register'}>Вернуться</NavLink>
				</p>
			</div>
		</motion.section>
	);
}

export default ConfirmOtp