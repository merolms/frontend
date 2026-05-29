import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Paper, TextInput, Button, Title, Text, Alert, Stack, Center, Anchor } from '@mantine/core';
import { AlertCircle, ArrowLeft, Check, GraduationCap, Lock } from 'lucide-react';
import { resetPassword } from '@/app/services/authService';

import { t } from '@/styles/theme';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
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
        <Paper className='auth-card' p="xl" radius="md" withBorder>
          {/* <Center mb="md"><GraduationCap size={48} color={t('primary')} /></Center> */}
          <Title order={3} ta="center" mb="lg">Reset Password</Title>

          {success ? (
            <Stack>
              <Alert icon={<Check size={16} />} color="green">
                <Text fw={600} size="sm">Password Reset Successful</Text>
                <Text size="sm">Your password has been updated. You can now sign in with your new password.</Text>
              </Alert>
              <Button fullWidth onClick={() => navigate('/login')} mt="md">Go to Sign In</Button>
            </Stack>
          ) : (
            <>
              <Text c="dimmed" ta="center" size="sm" mb="md">Enter your new password below.</Text>
              {error && <Alert icon={<AlertCircle size={16} />} color="red" mb="md" size="sm">{error}</Alert>}
              <form onSubmit={handleSubmit}>
                <Stack gap="sm">
                  <TextInput label="New Password" placeholder="At least 6 characters" type="password" leftSection={<Lock size={16} />} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <TextInput label="Confirm Password" placeholder="Re-enter your password" type="password" leftSection={<Lock size={16} />} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  <Button fullWidth size="lg" type="submit" loading={loading} className="auth-submit-btn">Reset Password</Button>
                </Stack>
              </form>
              <Anchor component={Link} to="/login" ta="center" mt="md" size="sm">
                <ArrowLeft size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Back to Sign In
              </Anchor>
            </>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default ResetPassword;
