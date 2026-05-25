import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Message, Header, Icon, Input } from 'semantic-ui-react';
import { resetPassword } from '../../../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await resetPassword('mock-token', password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <div className='auth-card'>
          <div className='auth-brand'>
            <Icon name='graduation cap' size='huge' color='green' />
            <Header as='h1' className='auth-brand-text'>MeroEdu</Header>
          </div>

          <Header as='h2' className='auth-title'>Reset Password</Header>

          {success ? (
            <div>
              <Message success>
                <Icon name='check circle' />
                <Message.Content>
                  <Message.Header>Password Reset Successful</Message.Header>
                  <p>Your password has been updated. You can now sign in with your new password.</p>
                </Message.Content>
              </Message>
              <Button primary fluid onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
                Go to Sign In
              </Button>
            </div>
          ) : (
            <>
              <p className='auth-subtitle'>Enter your new password below.</p>

              {error && (
                <Message error size='small' className='auth-error'>
                  <Icon name='warning circle' /> {error}
                </Message>
              )}

              <Form onSubmit={handleSubmit} loading={loading}>
                <Form.Field>
                  <label>New Password</label>
                  <Input
                    type='password'
                    placeholder='At least 6 characters'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon='lock'
                    iconPosition='left'
                    required
                  />
                </Form.Field>

                <Form.Field>
                  <label>Confirm Password</label>
                  <Input
                    type='password'
                    placeholder='Re-enter your password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon='lock'
                    iconPosition='left'
                    required
                  />
                </Form.Field>

                <Button primary fluid size='large' type='submit' loading={loading} className='auth-submit-btn'>
                  Reset Password
                </Button>
              </Form>

              <div className='auth-footer-link'>
                <Link to='/login'>
                  <Icon name='arrow left' /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
