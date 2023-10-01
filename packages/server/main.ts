import App from '@/App';
import RouteLists from '@/routes';

const app = new App(Object.values(RouteLists));

app.listen();
