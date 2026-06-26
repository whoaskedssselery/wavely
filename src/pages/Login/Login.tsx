import { NavLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { loginSchema, type LoginForm } from '@/schemas/auth.ts';
import './Login.scss';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginForm) => {
    console.log('Отправка данных:', data);
  };

  return (
    <motion.section
      className="login"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="login__brand">wavely</div>

      <div className="login__card">
        <h2 className="login__title">Вход в аккаунт</h2>

        <div className="login__oauth">
          <button type="button" className="login__oauth-btn">Google</button>
          <button type="button" className="login__oauth-btn">GitHub</button>
        </div>

        <div className="login__divider">
          <span>или</span>
        </div>

        <form className="login__form" onSubmit={handleSubmit(onSubmit)}>
          <div className="login__field">
            <label className="login__label" htmlFor="emailForm">Почта</label>
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
            <label className="login__label" htmlFor="passwordForm">Пароль</label>
            <input
              className="login__input"
              {...register('password')}
              type="password"
              id="passwordForm"
              autoComplete="current-password"
            />
            {errors.password && <p className="login__error">{errors.password.message}</p>}
          </div>
          <button className="login__submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="login__footer">
          Нет аккаунта? <NavLink to="/register">Зарегистрироваться</NavLink>
        </p>
      </div>
    </motion.section>
  );
};

export default Login;
