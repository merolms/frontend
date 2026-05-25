import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Message, Header, Icon, Input } from 'semantic-ui-react';
import { loginUser } from '../../../../redux/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(email, password));
  };

  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <div className='auth-card'>
          {/* Brand */}
          <div className='auth-brand'>
            <Icon name='graduation cap' size='huge' color='green' />
            <Header as='h1' className='auth-brand-text'>MeroEdu</Header>
            <p className='auth-brand-subtitle'>Learning Management System</p>
          </div>

          <Header as='h2' className='auth-title'>Sign In</Header>
          <p className='auth-subtitle'>Enter your credentials to access your account.</p>

          {error && (
            <Message error size='small' className='auth-error'>
              <Icon name='warning circle' /> {error}
            </Message>
          )}

          <Form onSubmit={handleSubmit} loading={loading}>
            <Form.Field>
              <label>Email</label>
              <Input
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon='mail'
                iconPosition='left'
                required
              />
            </Form.Field>

            <Form.Field>
              <label>Password</label>
              <Input
                type='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon='lock'
                iconPosition='left'
                required
              />
            </Form.Field>

            <div className='auth-form-actions'>
              <Link to='/forgot-password' className='auth-forgot-link'>
                Forgot password?
              </Link>
            </div>

            <Button primary fluid size='large' type='submit' loading={loading} className='auth-submit-btn'>
              Sign In
            </Button>
          </Form>

          {/* Static user hints */}
          <div className='auth-demo-users'>
            <p className='auth-demo-title'>Demo Accounts</p>
            <div className='auth-demo-list'>
              <div className='auth-demo-item' onClick={() => { setEmail('admin@meroedu.com'); setPassword('admin123'); }}>
                <span className='auth-demo-role admin'>Admin</span>
                <span className='auth-demo-email'>admin@meroedu.com</span>
              </div>
              <div className='auth-demo-item' onClick={() => { setEmail('instructor@meroedu.com'); setPassword('instructor123'); }}>
                <span className='auth-demo-role instructor'>Instructor</span>
                <span className='auth-demo-email'>instructor@meroedu.com</span>
              </div>
              <div className='auth-demo-item' onClick={() => { setEmail('teamlead@meroedu.com'); setPassword('teamlead123'); }}>
                <span className='auth-demo-role teamlead'>Team Lead</span>
                <span className='auth-demo-email'>teamlead@meroedu.com</span>
              </div>
              <div className='auth-demo-item' onClick={() => { setEmail('student@meroedu.com'); setPassword('student123'); }}>
                <span className='auth-demo-role student'>Student</span>
                <span className='auth-demo-email'>student@meroedu.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
