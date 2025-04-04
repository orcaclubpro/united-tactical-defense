import { http, HttpResponse } from 'msw';

// Define handlers that catch the requests in tests
export const handlers = [
  // Auth endpoints
  // @ts-ignore
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };
    
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      }, { status: 200 });
    }
    
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),
  
  // Appointment endpoints
  // @ts-ignore
  http.get('/api/appointments/available', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    
    if (date === 'invalid-date') {
      return HttpResponse.json({ errors: [{ msg: 'Invalid date format' }] }, { status: 400 });
    }
    
    if (date === '2023-06-16') {
      return HttpResponse.json([], { status: 200 });
    }
    
    return HttpResponse.json([
      { date: '2023-06-15', startTime: '09:00', endTime: '10:00' },
      { date: '2023-06-15', startTime: '11:00', endTime: '12:00' },
      { date: '2023-06-15', startTime: '14:00', endTime: '15:00' }
    ], { status: 200 });
  }),
  
  // @ts-ignore
  http.post('/api/appointments/lesson-request', async ({ request }) => {
    const body = await request.json();
    const { name, email, phone, date, startTime } = body as {
      name: string;
      email: string;
      phone: string;
      date: string;
      startTime: string;
    };
    
    if (!name || !email || !phone) {
      return HttpResponse.json({
        errors: [{ msg: 'Missing required fields' }]
      }, { status: 400 });
    }
    
    if (date === '2023-06-15' && startTime === '10:00') {
      return HttpResponse.json({ error: 'Time slot already booked' }, { status: 409 });
    }
    
    return HttpResponse.json({
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
    }, { status: 201 });
  }),
  
  // Form endpoints
  // @ts-ignore
  http.post('/api/forms/submit', async ({ request }) => {
    const body = await request.json();
    const { formType, formData } = body as {
      formType: string;
      formData: Record<string, any>;
    };
    
    if (!formType || !formData) {
      return HttpResponse.json({ errors: [{ msg: 'Missing required fields' }] }, { status: 400 });
    }
    
    return HttpResponse.json({
      id: 1,
      formType,
      formData,
      status: 'submitted',
      createdAt: new Date().toISOString()
    }, { status: 201 });
  }),
  
  // Analytics endpoints
  // @ts-ignore
  http.post('/api/analytics/event', () => {
    return new HttpResponse(null, { status: 204 });
  })
]; 