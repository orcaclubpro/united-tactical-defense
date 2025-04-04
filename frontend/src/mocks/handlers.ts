import { rest } from 'msw';

// Define handlers that catch the requests in tests
export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as { email: string; password: string };
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            role: 'user'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    );
  }),
  
  // Appointment endpoints
  rest.get('/api/appointments/available', (req, res, ctx) => {
    const date = req.url.searchParams.get('date');
    
    if (date === 'invalid-date') {
      return res(
        ctx.status(400),
        ctx.json({ errors: [{ msg: 'Invalid date format' }] })
      );
    }
    
    if (date === '2023-06-16') {
      return res(ctx.status(200), ctx.json([]));
    }
    
    return res(
      ctx.status(200),
      ctx.json([
        { date: '2023-06-15', startTime: '09:00', endTime: '10:00' },
        { date: '2023-06-15', startTime: '11:00', endTime: '12:00' },
        { date: '2023-06-15', startTime: '14:00', endTime: '15:00' }
      ])
    );
  }),
  
  rest.post('/api/appointments/lesson-request', (req, res, ctx) => {
    const { name, email, phone, date, startTime } = req.body as {
      name: string;
      email: string;
      phone: string;
      date: string;
      startTime: string;
    };
    
    if (!name || !email || !phone) {
      return res(
        ctx.status(400),
        ctx.json({
          errors: [{ msg: 'Missing required fields' }]
        })
      );
    }
    
    if (date === '2023-06-15' && startTime === '10:00') {
      return res(
        ctx.status(409),
        ctx.json({ error: 'Time slot already booked' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        appointment: {
          id: 1,
          date,
          startTime,
          endTime: startTime === '09:00' ? '10:00' : '13:00',
          status: 'scheduled'
        },
        lead: {
          id: 123,
          name,
          email,
          phone
        }
      })
    );
  }),
  
  // Form endpoints
  rest.post('/api/forms/submit', (req, res, ctx) => {
    const { formType, formData } = req.body as {
      formType: string;
      formData: Record<string, any>;
    };
    
    if (!formType || !formData) {
      return res(
        ctx.status(400),
        ctx.json({ errors: [{ msg: 'Missing required fields' }] })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 1,
        formType,
        formData,
        status: 'submitted',
        createdAt: new Date().toISOString()
      })
    );
  }),
  
  // Analytics endpoints
  rest.post('/api/analytics/event', (req, res, ctx) => {
    return res(ctx.status(204));
  })
]; 