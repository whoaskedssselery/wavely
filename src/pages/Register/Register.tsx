import { NavLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { registerSchema, type RegisterForm } from '@/schemas/auth.ts';
import './Register.scss';

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterForm) => {
    console.log('Отправка данных:', data);
  };

  return (
    <motion.section
      className="register"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="register__brand">wavely</div>

      <div className="register__card">
        <h2 className="register__title">Регистрация</h2>

        <div className="register__oauth">
          <button type="button" className="register__oauth-btn">Google</button>
          <button type="button" className="register__oauth-btn">GitHub</button>
        </div>

        <div className="register__divider">
          <span>или</span>
        </div>

        <form className="register__form" onSubmit={handleSubmit(onSubmit)}>
          <div className="register__field">
            <label className="register__label" htmlFor="usernameForm">Имя</label>
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
            <label className="register__label" htmlFor="emailForm">Почта</label>
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
            <label className="register__label" htmlFor="passwordForm">Пароль</label>
            <input
              className="register__input"
              {...register('password')}
              type="password"
              id="passwordForm"
              autoComplete="new-password"
            />
            {errors.password && <p className="register__error">{errors.password.message}</p>}
          </div>
          <div className="register__field">
            <label className="register__label" htmlFor="confirmPasswordForm">Подтвердите пароль</label>
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

        <p className="register__footer">
          Уже есть аккаунт? <NavLink to="/login">Войти</NavLink>
        </p>
      </div>
    </motion.section>
  );
};

export default Register;
