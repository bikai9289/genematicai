export function configurationManagementClosed() {
  return Response.json(
    {
      code: -1,
      message:
        'System configuration is managed through deployment environment variables.',
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } }
  );
}
