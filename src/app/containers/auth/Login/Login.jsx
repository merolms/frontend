import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Paper, TextInput, Button, Title, Text, Alert, Stack, Anchor, Center, Box, Image, Group } from '@mantine/core';
import { AlertCircle, GraduationCap, Lock, Mail } from 'lucide-react';
import { loginUser } from '@/redux/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        <Paper className='auth-card' p="xl" radius="md" withBorder>
          <Center mb="md">
            {/* <GraduationCap size={48} color="#33a163" /> */}
          </Center>
          <Title order={2} ta="center" mb={4} className="auth-brand-text">MeroEdu</Title>
          <Text c="dimmed" ta="center" size="sm" mb="lg">Learning Management System</Text>

          <Title order={3} ta="center" mb={4}>Sign In</Title>
          <Text c="dimmed" ta="center" size="sm" mb="md">Enter your credentials to access your account.</Text>

          {error && (
            <Alert icon={<AlertCircle size={16} />} color="red" mb="md" size="sm">{error}</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <TextInput label="Email" placeholder="you@example.com" type="email" leftSection={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} required />
              <TextInput label="Password" placeholder="Enter your password" type="password" leftSection={<Lock size={16} />} value={password} onChange={(e) => setPassword(e.target.value)} required />

              <Group justify="flex-end">
                <Anchor component={Link} to="/forgot-password" size="sm">Forgot password?</Anchor>
              </Group>

              <Button fullWidth size="lg" type="submit" loading={loading} className="auth-submit-btn">Sign In</Button>
            </Stack>
          </form>

          <Text ta="center" size="xs" c="dimmed" mt="lg" mb={8}>Demo Accounts</Text>
          <Stack gap={4}>
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
          </Stack>
        </Paper>
      </div>
    </div>
  );
};

export default Login;
