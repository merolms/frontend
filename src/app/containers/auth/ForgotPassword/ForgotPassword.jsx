import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Paper, TextInput, Button, Title, Text, Alert, Stack, Center, Anchor } from '@mantine/core';
import { IconMail, IconAlertCircle, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { forgotPassword } from '@/app/services/authService';

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
        <Paper className='auth-card' p="xl" radius="md" withBorder>
          {/* <Center mb="md"><IconGraduationCap size={48} color="#33a163" /></Center> */}
          <Title order={3} ta="center" mb="lg">Forgot Password</Title>

          {success ? (
            <Stack>
              <Alert icon={<IconCheck size={16} />} color="green">
                <Text fw={600} size="sm">Check your email</Text>
                <Text size="sm">If an account with that email exists, we've sent password reset instructions.</Text>
              </Alert>
              <Button fullWidth component={Link} to="/login" mt="md" leftSection={<IconArrowLeft size={16} />}>Back to Sign In</Button>
            </Stack>
          ) : (
            <>
              <Text c="dimmed" ta="center" size="sm" mb="md">Enter your email address and we'll send you instructions to reset your password.</Text>
              {error && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" size="sm">{error}</Alert>}
              <form onSubmit={handleSubmit}>
                <Stack gap="sm">
                  <TextInput label="Email" placeholder="you@example.com" type="email" leftSection={<IconMail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Button fullWidth size="lg" type="submit" loading={loading} className="auth-submit-btn">Send Reset Link</Button>
                </Stack>
              </form>
              <Anchor component={Link} to="/login" ta="center" mt="md" size="sm">
                <IconArrowLeft size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Back to Sign In
              </Anchor>
            </>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default ForgotPassword;
