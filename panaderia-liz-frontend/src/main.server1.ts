import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { config } from './app/app.config.server1';

const bootstrap = (context?: unknown) => bootstrapApplication(AppComponent, config);

export default bootstrap;