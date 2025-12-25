import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.route';
import { PercelRout } from '../modules/percel/percel.route';
import { dashboardRoute } from '../modules/dashboard/dashboard.route';


export const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/parcel',
    route: PercelRout,
  },

  {
      path: "/dashboard",
      route: dashboardRoute
  },
];

moduleRoutes.forEach(route => {
  if (route.route) {
    router.use(route.path, route.route);
  }
});
