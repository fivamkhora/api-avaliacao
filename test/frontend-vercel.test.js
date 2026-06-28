const request = require('supertest');

const frontendUrl = process.env.FRONTEND_URL;
const describeFrontend = frontendUrl ? describe : describe.skip;

describeFrontend('Frontend Vercel Next.js', () => {
  it('deve responder a pagina inicial como uma aplicacao Next.js', async () => {
    const response = await request(frontendUrl).get('/');

    expect(response.status).toBe(200);
    expect(response.headers['x-vercel-id']).toEqual(expect.any(String));
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toEqual(expect.stringContaining('__NEXT_DATA__'));
    expect(response.text).toEqual(expect.stringContaining('/_next/'));
  }, 15000);
});
