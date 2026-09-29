export interface SwaggerModule {
  tags: Array<{ name: string; description?: string }>;
  paths: Record<string, unknown>;
  components: { schemas: Record<string, unknown> };
}
