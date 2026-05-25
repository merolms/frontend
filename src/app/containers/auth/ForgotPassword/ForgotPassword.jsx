import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Message, Header, Icon, Input } from 'semantic-ui-react';
import { forgotPassword } from '../../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await forgotPassword(email);
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

          <Header as='h2' className='auth-title'>Forgot Password</Header>

          {success ? (
            <div>
              <Message success>
                <Icon name='check circle' />
                <Message.Content>
                  <Message.Header>Check your email</Message.Header>
                  <p>If an account with that email exists, we've sent password reset instructions.</p>
                </Message.Content>
              </Message>
              <Button primary fluid as={Link} to='/login' style={{ marginTop: 16 }}>
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <p className='auth-subtitle'>Enter your email address and we'll send you instructions to reset your password.</p>

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

                <Button primary fluid size='large' type='submit' loading={loading} className='auth-submit-btn'>
                  Send Reset Link
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

export default ForgotPassword;
