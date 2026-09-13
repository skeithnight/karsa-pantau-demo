import { RolesGuard } from '../roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@karsa/shared-types';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockContext(user?: { role: string }): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('harus mengizinkan akses bila tidak ada role yang dipersyaratkan', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ role: UserRole.SUPERVISOR });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('harus mengizinkan akses bila user memiliki salah satu role yang sesuai', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN, UserRole.PM]);
    const context = createMockContext({ role: UserRole.PM });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('harus melempar ForbiddenException bila role user tidak cocok', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.APPROVER]);
    const context = createMockContext({ role: UserRole.ESTIMATOR });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('harus melempar ForbiddenException bila user tidak ada di request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
