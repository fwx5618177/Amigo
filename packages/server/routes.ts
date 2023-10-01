import { Routes } from '@interfaces/routes.interface';
import IndexRoute from './routes/index.route';

const RouteLists: Record<string, Routes> = {
    qq: new IndexRoute(),
};

export default RouteLists;
